import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';

const router = Router();

router.post('/email', notificationController.sendEmail);
router.post('/order-confirmation', notificationController.sendOrderConfirmation);
router.post('/otp', notificationController.sendOtp);

export default router;
