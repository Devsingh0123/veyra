import Order from '../models/Order.model.js';
import Coupon from '../models/Coupon.model.js';
import { gstService } from './gst.service.js';
import { fsmService } from './fsm.service.js';

export const orderService = {
  /**
   * Calculate real-time checkout quotation including GST, discounts, and COD eligibility
   */
  async getQuote({ items, destinationStateCode = 'DL', paymentMethod = 'PREPAID', couponCode = null }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('At least one item is required to generate a checkout quote');
    }

    // 1. GST & Item totals
    const gstCalculation = gstService.calculateOrderTax(items, destinationStateCode);
    const subtotal = gstCalculation.subtotal;

    // 2. Coupon evaluation
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase()
      });

      if (!coupon || !coupon.isActive) {
        throw new Error('Invalid or inactive coupon code');
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error('Coupon code has expired');
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error('Coupon usage limit reached');
      }

      const minOrder = parseFloat(coupon.minOrderAmount.toString());
      if (subtotal < minOrder) {
        throw new Error(`Minimum order amount of ₹${minOrder} required for coupon ${coupon.code}`);
      }

      const discountVal = parseFloat(coupon.discountValue.toString());
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = parseFloat(((subtotal * discountVal) / 100).toFixed(2));
        if (coupon.maxDiscountAmount) {
          const maxDiscount = parseFloat(coupon.maxDiscountAmount.toString());
          if (discountAmount > maxDiscount) {
            discountAmount = maxDiscount;
          }
        }
      } else {
        discountAmount = discountVal;
      }

      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }

      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount
      };
    }

    // 3. Shipping fee calculation (Free above ₹499)
    const shippingFee = subtotal >= 499 ? 0 : 49;

    // 4. COD Risk Rules
    let codFee = 0;
    let isCodEligible = true;
    let codIneligibilityReason = null;

    if (paymentMethod === 'COD') {
      if (subtotal < 299) {
        isCodEligible = false;
        codIneligibilityReason = 'Cash on Delivery is only available for orders of ₹299 or more.';
      } else if (subtotal > 5000) {
        isCodEligible = false;
        codIneligibilityReason = 'Cash on Delivery is not allowed for orders exceeding ₹5,000 for risk prevention.';
      } else {
        codFee = 49; // Flat COD handling fee
      }

      if (!isCodEligible) {
        throw new Error(codIneligibilityReason);
      }
    }

    // 5. Total payable amount
    const totalAmount = parseFloat(
      Math.max(0, subtotal - discountAmount + shippingFee + codFee).toFixed(2)
    );

    return {
      subtotal,
      discountAmount,
      shippingFee,
      codFee,
      totalAmount,
      taxBreakdown: {
        taxableValue: gstCalculation.taxableValue,
        totalTax: gstCalculation.totalTax,
        cgst: gstCalculation.cgst,
        sgst: gstCalculation.sgst,
        igst: gstCalculation.igst
      },
      appliedCoupon,
      lineItems: gstCalculation.lineItems
    };
  },

  /**
   * Create an order with immutable snapshots
   */
  async createOrder({
    userId,
    items,
    shippingAddress,
    billingAddress,
    paymentMethod = 'PREPAID',
    couponCode = null
  }) {
    if (!userId) throw new Error('User ID is required');
    if (!shippingAddress) throw new Error('Shipping address is required');
    if (!items || items.length === 0) throw new Error('Items list cannot be empty');

    const destState = shippingAddress.stateCode || shippingAddress.state || 'DL';

    // Get validated quote
    const quote = await this.getQuote({
      items,
      destinationStateCode: destState,
      paymentMethod,
      couponCode
    });

    const orderNumber = `VYR-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialStatus = paymentMethod === 'COD' ? 'CONFIRMED' : 'PAYMENT_PENDING';
    const initialPaymentStatus = 'PENDING';

    const orderItemsData = quote.lineItems.map((item) => ({
      productId: item.productId || null,
      variantId: item.variantId,
      productTitle: item.productTitle || item.name || 'Product',
      variantTitle: item.variantTitle || item.title || 'Standard',
      sku: item.sku || `SKU-${item.variantId.slice(0, 8)}`,
      hsnCode: item.hsnCode || '00000000',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      taxRate: item.taxRate,
      taxAmount: item.taxAmount,
      totalPrice: item.totalPrice,
      itemAttributes: item.itemAttributes || item.variantOptions || {}
    }));

    const initialHistory = [
      {
        fromState: 'PENDING',
        toState: initialStatus,
        actorRole: 'CUSTOMER',
        note: paymentMethod === 'COD' ? 'COD order placed and confirmed' : 'Order created, awaiting payment'
      }
    ];

    const createdOrder = await Order.create({
      orderNumber,
      userId,
      status: initialStatus,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      subtotal: quote.subtotal,
      discountAmount: quote.discountAmount,
      shippingFee: quote.shippingFee,
      codFee: quote.codFee,
      taxAmount: quote.taxBreakdown.totalTax,
      cgstAmount: quote.taxBreakdown.cgst,
      sgstAmount: quote.taxBreakdown.sgst,
      igstAmount: quote.taxBreakdown.igst,
      totalAmount: quote.totalAmount,
      couponCode: quote.appliedCoupon?.code || null,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items: orderItemsData,
      history: initialHistory
    });

    // Update coupon usage if applicable
    if (quote.appliedCoupon?.code) {
      await Coupon.findOneAndUpdate(
        { code: quote.appliedCoupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    return await this.getOrderById(createdOrder.id);
  },

  /**
   * Fetch single order with items and history
   */
  async getOrderById(orderId, userId = null) {
    const order = await Order.findById(orderId)
      .populate('invoice')
      .populate('shipment')
      .populate('returns');

    if (!order) {
      throw new Error('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized access to this order');
    }

    return order;
  },

  /**
   * List customer orders with pagination
   */
  async listUserOrders(userId, { page = 1, limit = 10, status = null }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('shipment')
    ]);

    return {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  /**
   * Cancel order (customer or admin initiated)
   */
  async cancelOrder(orderId, userId = null, reason = 'Cancelled by user') {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (!fsmService.isCancellable(order.status)) {
      throw new Error(`Order cannot be cancelled in "${order.status}" status`);
    }

    fsmService.validateTransition(order.status, 'CANCELLED');

    const oldStatus = order.status;
    order.status = 'CANCELLED';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    order.history.push({
      fromState: oldStatus,
      toState: 'CANCELLED',
      actorRole: userId ? 'CUSTOMER' : 'ADMIN',
      note: reason
    });

    await order.save();
    return order;
  },

  /**
   * Update order status with FSM check (Admin / Worker)
   */
  async updateOrderStatus(orderId, nextState, { actorRole = 'ADMIN', note = '' } = {}) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    fsmService.validateTransition(order.status, nextState);

    const oldStatus = order.status;
    order.status = nextState;

    // Automatic payment status sync
    if (nextState === 'DELIVERED' && order.paymentMethod === 'COD') {
      order.paymentStatus = 'PAID';
    } else if (nextState === 'CONFIRMED' && order.paymentMethod === 'PREPAID') {
      order.paymentStatus = 'PAID';
    } else if (nextState === 'REFUNDED') {
      order.paymentStatus = 'REFUNDED';
    }

    order.history.push({
      fromState: oldStatus,
      toState: nextState,
      actorRole,
      note: note || `State transitioned to ${nextState}`
    });

    await order.save();
    return order;
  },

  /**
   * List all orders (Admin)
   */
  async listAllOrders({ page = 1, limit = 20, status = null, search = '' }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('shipment')
    ]);

    return {
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
};

export default orderService;
