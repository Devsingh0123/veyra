import nodemailer from 'nodemailer';
import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../redis.js';
import { templateService } from './template.service.js';

class NotificationService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'Veyra Support <support@veyra.in>';
    this.isMock = process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER;

    // Nodemailer transport
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: {
        user: process.env.SMTP_USER || 'mock_user',
        pass: process.env.SMTP_PASS || 'mock_pass'
      }
    });

    // BullMQ Queue setup (lazy initialization)
    try {
      this.queue = new Queue('notifications', { connection: redisConnection });
    } catch (err) {
      console.warn('[Notification Service] Queue initialization warning:', err.message);
    }
  }

  /**
   * Send Email directly
   */
  async sendEmailDirect({ to, subject, html, text }) {
    if (!to || !subject) {
      throw new Error('Recipient "to" and "subject" are required');
    }

    if (this.isMock) {
      console.log(`[Notification Service] [DEV MOCK EMAIL] Sent to: ${to} | Subject: "${subject}"`);
      return {
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        status: 'delivered_mock',
        to,
        subject
      };
    }

    return this.transporter.sendMail({
      from: this.fromEmail,
      to,
      subject,
      text: text || '',
      html: html || ''
    });
  }

  /**
   * Send SMS / WhatsApp OTP
   */
  async sendOtpDirect({ phone, otp, type = 'LOGIN' }) {
    if (!phone || !otp) {
      throw new Error('phone and otp are required');
    }

    console.log(`[Notification Service] [SMS/OTP DISPATCH] To: ${phone} | OTP: ${otp} | Purpose: ${type}`);
    return {
      status: 'dispatched',
      phone,
      type,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Queue email notification asynchronously via BullMQ
   */
  async queueEmail({ to, subject, html, text }) {
    if (!this.queue) {
      return this.sendEmailDirect({ to, subject, html, text });
    }

    const job = await this.queue.add(
      'send_email',
      { to, subject, html, text },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    );

    return { jobId: job.id, status: 'queued' };
  }

  /**
   * Send or queue order confirmation email
   */
  async sendOrderConfirmation({ to, orderNumber, totalAmount, customerName, items = [] }) {
    const html = templateService.renderOrderConfirmation({
      orderNumber,
      totalAmount,
      customerName,
      items
    });

    return this.queueEmail({
      to,
      subject: `Order #${orderNumber} Confirmed - Veyra`,
      html,
      text: `Your Veyra order #${orderNumber} for ₹${totalAmount} has been confirmed!`
    });
  }

  /**
   * Initialize BullMQ background consumer worker
   */
  initWorker() {
    try {
      this.worker = new Worker(
        'notifications',
        async (job) => {
          if (job.name === 'send_email') {
            await this.sendEmailDirect(job.data);
          }
        },
        { connection: redisConnection }
      );

      this.worker.on('failed', (job, err) => {
        console.error(`[Notification Service] Job ${job?.id} failed:`, err.message);
      });
    } catch (err) {
      console.warn('[Notification Service] Background worker warning:', err.message);
    }
  }
}

export const notificationService = new NotificationService();
