import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);

export default router;
