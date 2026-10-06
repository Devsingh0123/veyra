import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-intent', paymentController.createIntent);
router.post('/verify', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);
router.post('/refund', paymentController.issueRefund);
router.get('/order/:orderId', paymentController.getPaymentByOrder);

export default router;
