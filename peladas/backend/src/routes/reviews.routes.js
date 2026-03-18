import { Router } from 'express';
import {
  getReviewsByCourt,
  createReview
} from '../controllers/reviews.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createReviewSchema } from '../schemas/review.schema.js';

const router = Router();

// Public routes
router.get('/court/:id', getReviewsByCourt);

// Protected routes
router.post('/', authenticate, validate(createReviewSchema), createReview);

export default router;
