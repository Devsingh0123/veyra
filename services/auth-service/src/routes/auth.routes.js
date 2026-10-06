import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.google);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected user profile routes
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateMe);

export default router;
