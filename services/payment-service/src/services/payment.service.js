import PaymentIntent from '../models/PaymentIntent.model.js';
import WebhookEvent from '../models/WebhookEvent.model.js';
import Refund from '../models/Refund.model.js';
import { razorpayService } from './razorpay.service.js';

export const paymentService = {
  /**
   * Create Razorpay order and internal payment intent
   */
  async createPaymentIntent({ orderId, userId, amountInRupees }) {
    if (!orderId) throw new Error('orderId is required');
    if (!userId) throw new Error('userId is required');
    if (!amountInRupees || amountInRupees <= 0) throw new Error('Valid amountInRupees is required');

    const amountPaise = BigInt(Math.round(parseFloat(amountInRupees) * 100));

    // 1. Call Razorpay API to generate order
    const rzpOrder = await razorpayService.createOrder({
      amountPaise,
      currency: 'INR',
      receipt: `rcpt_${orderId.substring(0, 12)}`,
      notes: { orderId, userId }
    });

    // 2. Persist PaymentIntent in MongoDB
    const intent = await PaymentIntent.create({
      orderId,
      userId,
      razorpayOrderId: rzpOrder.id,
      amountPaise: amountPaise.toString(),
      currency: 'INR',
      status: 'CREATED'
    });

    return {
      paymentIntentId: intent.id,
      razorpayOrderId: intent.razorpayOrderId,
      amountPaise: intent.amountPaise.toString(),
      amountInRupees: parseFloat(amountInRupees),
      currency: intent.currency,
      keyId: razorpayService.keyId
    };
  },

  /**
   * Client-side signature verification & capture confirmation
   */
  async verifyPayment({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('razorpayOrderId, razorpayPaymentId, and razorpaySignature are required');
    }

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValid) {
      throw new Error('Invalid Razorpay payment signature');
    }

    // Update payment intent
    const intent = await PaymentIntent.findOneAndUpdate(
      { razorpayOrderId },
      {
        $set: {
          razorpayPaymentId,
          status: 'CAPTURED',
          method: 'PREPAID'
        }
      },
      { new: true }
    );

    // Best-effort notification to order service
    const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
    try {
      await fetch(`${orderServiceUrl}/api/v1/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SYSTEM'
        },
        body: JSON.stringify({
          status: 'CONFIRMED',
          note: `Prepaid payment captured via Razorpay (Payment ID: ${razorpayPaymentId})`
        })
      });
    } catch (err) {
      console.warn('[Payment Service] Warning notifying order-service of captured payment:', err.message);
    }

    return {
      success: true,
      status: 'CAPTURED',
      paymentIntentId: intent ? intent.id : null,
      razorpayPaymentId
    };
  },

  /**
   * Idempotent webhook event processor
   */
  async processWebhookEvent({ eventId, eventType, payload }) {
    if (!eventId || !eventType) {
      throw new Error('eventId and eventType are required for webhook ingestion');
    }

    // 1. Idempotency Check
    const existing = await WebhookEvent.findOne({ eventId });
    if (existing) {
      return { duplicate: true, message: 'Event already processed' };
    }

    // 2. Record event in ledger
    await WebhookEvent.create({
      eventId,
      eventType,
      payload: payload || {},
      isProcessed: true
    });

    if (eventType === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        await PaymentIntent.updateMany(
          { razorpayOrderId: rzpOrderId },
          {
            $set: {
              razorpayPaymentId: rzpPaymentId,
              status: 'CAPTURED',
              method: paymentEntity?.method || 'PREPAID'
            }
          }
        );
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;

      if (rzpOrderId) {
        await PaymentIntent.updateMany(
          { razorpayOrderId: rzpOrderId },
          {
            $set: { status: 'FAILED' }
          }
        );
      }
    }

    return { success: true, eventId, eventType };
  },

  /**
   * Issue refund
   */
  async issueRefund({ paymentIntentId, amountPaise, reason = 'Customer refund' }) {
    const intent = await PaymentIntent.findById(paymentIntentId);

    if (!intent) {
      throw new Error('Payment intent not found');
    }

    if (intent.status !== 'CAPTURED') {
      throw new Error(`Cannot refund payment with status "${intent.status}"`);
    }

    const refundAmount = amountPaise ? BigInt(amountPaise) : BigInt(intent.amountPaise);

    // Call Razorpay API
    const rzpRefund = await razorpayService.createRefund({
      paymentId: intent.razorpayPaymentId,
      amountPaise: refundAmount,
      notes: { paymentIntentId, reason }
    });

    // Record in database
    const refund = await Refund.create({
      paymentIntentId,
      razorpayRefundId: rzpRefund.id,
      amountPaise: refundAmount.toString(),
      reason,
      status: 'REFUNDED'
    });

    intent.status = 'REFUNDED';
    await intent.save();

    return {
      success: true,
      refundId: refund.id,
      razorpayRefundId: refund.razorpayRefundId,
      amountPaise: refund.amountPaise.toString()
    };
  },

  /**
   * Get payment details by Order ID
   */
  async getPaymentByOrderId(orderId) {
    const intent = await PaymentIntent.findOne({ orderId }).populate('refunds');

    if (!intent) {
      throw new Error('Payment record not found for this order');
    }

    const intentObj = intent.toJSON();
    intentObj.amountPaise = intent.amountPaise.toString();
    intentObj.refunds = (intent.refunds || []).map(r => ({
      ...r,
      amountPaise: r.amountPaise ? r.amountPaise.toString() : '0'
    }));

    return intentObj;
  }
};

export default paymentService;
