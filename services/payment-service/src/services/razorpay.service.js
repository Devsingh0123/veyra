import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_veyra_dev_key';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'veyra_dev_secret_mock';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'veyra_webhook_secret_dev';

    this.isMockMode = this.keyId.includes('mock') || this.keyId.includes('veyra_dev');

    if (!this.isMockMode) {
      try {
        this.client = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret
        });
      } catch (err) {
        console.warn('Razorpay initialization fallback to mock mode:', err.message);
        this.isMockMode = true;
      }
    }
  }

  /**
   * Create an order on Razorpay
   */
  async createOrder({ amountPaise, currency = 'INR', receipt, notes = {} }) {
    if (this.isMockMode || !this.client) {
      const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        id: mockOrderId,
        entity: 'order',
        amount: Number(amountPaise),
        currency,
        receipt,
        status: 'created',
        notes
      };
    }

    return this.client.orders.create({
      amount: Number(amountPaise),
      currency,
      receipt,
      notes
    });
  }

  /**
   * Verify signature for client-side payment completion (razorpay_signature)
   */
  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (this.isMockMode && razorpaySignature === 'mock_valid_signature') {
      return true;
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  }

  /**
   * Verify webhook signature against raw incoming request body
   */
  verifyWebhookSignature({ rawBody, signature }) {
    if (this.isMockMode && signature === 'mock_webhook_signature') {
      return true;
    }

    if (!rawBody || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Create a refund on Razorpay
   */
  async createRefund({ paymentId, amountPaise, notes = {} }) {
    if (this.isMockMode || !this.client) {
      return {
        id: `rfnd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        entity: 'refund',
        amount: Number(amountPaise),
        currency: 'INR',
        payment_id: paymentId,
        status: 'processed',
        notes
      };
    }

    return this.client.payments.refund(paymentId, {
      amount: Number(amountPaise),
      notes
    });
  }
}

export const razorpayService = new RazorpayService();
