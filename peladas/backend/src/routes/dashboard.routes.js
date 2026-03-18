import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate, requireOwner } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, requireOwner);

router.get('/', getDashboard);

export default router;
