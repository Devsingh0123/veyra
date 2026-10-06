import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';

const router = Router();

// 1. Checkout & Quote
router.post('/quote', orderController.getQuote);

// 2. Logistics Webhook (Carrier updates)
router.post('/logistics/webhook', orderController.handleLogisticsWebhook);

// 3. Customer order operations
router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

// 4. Invoicing
router.get('/:id/invoice', orderController.getInvoice);
router.get('/:id/invoice/html', orderController.getInvoiceHtml);

// 5. Logistics Tracking
router.get('/:id/shipment', orderController.getShipment);

// 6. Admin order & dispatch operations
router.get('/admin/all', orderController.listAllOrders);
router.patch('/admin/:id/status', orderController.updateStatus);
router.post('/admin/:id/shipment', orderController.createShipment);

export default router;
