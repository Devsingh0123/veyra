import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';

const router = Router();

// Checkout & Quote
router.post('/quote', orderController.getQuote);

// Customer order operations
router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin order operations
router.get('/admin/all', orderController.listAllOrders);
router.patch('/admin/:id/status', orderController.updateStatus);

export default router;
