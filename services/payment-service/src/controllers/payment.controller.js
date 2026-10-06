import { paymentService } from '../services/payment.service.js';
import { razorpayService } from '../services/razorpay.service.js';

export const paymentController = {
  /**
   * POST /api/v1/payments/create-intent
   */
  async createIntent(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { orderId, amountInRupees } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required: userId is missing' });
      }

      if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId is required' });
      }

      if (!amountInRupees || parseFloat(amountInRupees) <= 0) {
        return res.status(400).json({ success: false, error: 'Valid amountInRupees is required' });
      }

      const intent = await paymentService.createPaymentIntent({
        orderId,
        userId,
        amountInRupees: parseFloat(amountInRupees)
      });

      return res.status(201).json({
        success: true,
        message: 'Payment intent created',
        data: intent
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/payments/verify
   */
  async verifyPayment(req, res) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required'
        });
      }

      const result = await paymentService.verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and captured',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/payments/webhook
   */
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

      // Verify webhook HMAC
      const isValid = razorpayService.verifyWebhookSignature({
        rawBody,
        signature
      });

      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
      }

      const eventId = req.body.id || req.headers['x-razorpay-event-id'] || `evt_${Date.now()}`;
      const eventType = req.body.event;
      const payload = req.body.payload;

      const result = await paymentService.processWebhookEvent({
        eventId,
        eventType,
        payload
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/payments/refund (Admin)
   */
  async issueRefund(req, res) {
    try {
      const { paymentIntentId, amountPaise, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ success: false, error: 'paymentIntentId is required' });
      }

      const refund = await paymentService.issueRefund({
        paymentIntentId,
        amountPaise,
        reason
      });

      return res.status(200).json({
        success: true,
        message: 'Refund issued successfully',
        data: refund
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/payments/order/:orderId
   */
  async getPaymentByOrder(req, res) {
    try {
      const { orderId } = req.params;
      const payment = await paymentService.getPaymentByOrderId(orderId);

      return res.status(200).json({ success: true, data: payment });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  }
};
