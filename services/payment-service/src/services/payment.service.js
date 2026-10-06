import prisma from '../prisma.js';
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

    // 2. Persist PaymentIntent in DB
    const intent = await prisma.paymentIntent.create({
      data: {
        orderId,
        userId,
        razorpayOrderId: rzpOrder.id,
        amountPaise,
        currency: 'INR',
        status: 'CREATED'
      }
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
    const intent = await prisma.paymentIntent.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: 'CAPTURED',
        method: 'PREPAID'
      }
    });

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
      paymentIntentId: intent.id,
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
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId }
    });

    if (existing) {
      return { duplicate: true, message: 'Event already processed' };
    }

    // 2. Process based on event type
    await prisma.$transaction(async (tx) => {
      // Record event in ledger
      await tx.webhookEvent.create({
        data: {
          eventId,
          eventType,
          payload: payload || {},
          isProcessed: true
        }
      });

      if (eventType === 'payment.captured') {
        const paymentEntity = payload?.payment?.entity;
        const rzpOrderId = paymentEntity?.order_id;
        const rzpPaymentId = paymentEntity?.id;

        if (rzpOrderId) {
          await tx.paymentIntent.updateMany({
            where: { razorpayOrderId: rzpOrderId },
            data: {
              razorpayPaymentId: rzpPaymentId,
              status: 'CAPTURED',
              method: paymentEntity?.method || 'PREPAID'
            }
          });
        }
      } else if (eventType === 'payment.failed') {
        const paymentEntity = payload?.payment?.entity;
        const rzpOrderId = paymentEntity?.order_id;

        if (rzpOrderId) {
          await tx.paymentIntent.updateMany({
            where: { razorpayOrderId: rzpOrderId },
            data: { status: 'FAILED' }
          });
        }
      }
    });

    return { success: true, eventId, eventType };
  },

  /**
   * Issue refund
   */
  async issueRefund({ paymentIntentId, amountPaise, reason = 'Customer refund' }) {
    const intent = await prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId }
    });

    if (!intent) {
      throw new Error('Payment intent not found');
    }

    if (intent.status !== 'CAPTURED') {
      throw new Error(`Cannot refund payment with status "${intent.status}"`);
    }

    const refundAmount = amountPaise ? BigInt(amountPaise) : intent.amountPaise;

    // Call Razorpay API
    const rzpRefund = await razorpayService.createRefund({
      paymentId: intent.razorpayPaymentId,
      amountPaise: refundAmount,
      notes: { paymentIntentId, reason }
    });

    // Record in database
    const refundRecord = await prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          paymentIntentId,
          razorpayRefundId: rzpRefund.id,
          amountPaise: refundAmount,
          reason,
          status: 'REFUNDED'
        }
      });

      await tx.paymentIntent.update({
        where: { id: paymentIntentId },
        data: { status: 'REFUNDED' }
      });

      return refund;
    });

    return {
      success: true,
      refundId: refundRecord.id,
      razorpayRefundId: refundRecord.razorpayRefundId,
      amountPaise: refundRecord.amountPaise.toString()
    };
  },

  /**
   * Get payment details by Order ID
   */
  async getPaymentByOrderId(orderId) {
    const intent = await prisma.paymentIntent.findFirst({
      where: { orderId },
      include: { refunds: true }
    });

    if (!intent) {
      throw new Error('Payment record not found for this order');
    }

    return {
      ...intent,
      amountPaise: intent.amountPaise.toString(),
      refunds: intent.refunds.map(r => ({
        ...r,
        amountPaise: r.amountPaise.toString()
      }))
    };
  }
};
