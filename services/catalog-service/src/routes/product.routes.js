import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.post('/', productController.createProduct);

export default router;
