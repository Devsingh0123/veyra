import { notificationService } from '../services/notification.service.js';

export const notificationController = {
  /**
   * POST /api/v1/notifications/email
   */
  async sendEmail(req, res) {
    try {
      const { to, subject, html, text, queue = true } = req.body;

      if (!to || !subject) {
        return res.status(400).json({ success: false, error: 'Recipient "to" and "subject" are required' });
      }

      const result = queue
        ? await notificationService.queueEmail({ to, subject, html, text })
        : await notificationService.sendEmailDirect({ to, subject, html, text });

      return res.status(200).json({ success: true, message: 'Email processed', data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/notifications/order-confirmation
   */
  async sendOrderConfirmation(req, res) {
    try {
      const { to, orderNumber, totalAmount, customerName, items } = req.body;

      if (!to || !orderNumber || !totalAmount) {
        return res.status(400).json({
          success: false,
          error: 'Recipient "to", "orderNumber", and "totalAmount" are required'
        });
      }

      const result = await notificationService.sendOrderConfirmation({
        to,
        orderNumber,
        totalAmount,
        customerName: customerName || 'Valued Customer',
        items: items || []
      });

      return res.status(200).json({
        success: true,
        message: 'Order confirmation queued',
        data: result
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/notifications/otp
   */
  async sendOtp(req, res) {
    try {
      const { phone, otp, type } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'phone and otp are required' });
      }

      const result = await notificationService.sendOtpDirect({ phone, otp, type });

      return res.status(200).json({
        success: true,
        message: 'OTP dispatched',
        data: result
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
