import { Router } from 'express';
import { getCurrentUser, updateProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', getCurrentUser);
router.patch('/profile', updateProfile);

export default router;
