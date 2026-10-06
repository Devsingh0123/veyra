import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';

const router = Router();

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:variantId', cartController.updateItem);
router.delete('/items/:variantId', cartController.removeItem);
router.post('/merge', cartController.merge);
router.delete('/clear', cartController.clear);

export default router;
