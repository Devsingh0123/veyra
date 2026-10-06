import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';

const router = Router();

router.get('/:variantId', inventoryController.getStock);
router.post('/reserve', inventoryController.reserve);
router.post('/release', inventoryController.release);
router.post('/fulfill', inventoryController.fulfill);

export default router;
