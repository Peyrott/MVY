import { Router } from 'express';
import { createPreference } from '../controllers/payments.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/preference', createPreference);

export default router;
