import { Router } from 'express';
import {
  listCourts,
  getCourt,
  getTimeSlots,
  createCourt,
  updateCourt,
  toggleCourt,
  uploadPhoto
} from '../controllers/courts.controller.js';
import { authenticate, requireOwner } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createCourtSchema, updateCourtSchema } from '../schemas/court.schema.js';

const router = Router();

// Public routes
router.get('/', listCourts);
router.get('/:id', getCourt);
router.get('/:id/slots', getTimeSlots);

// Protected routes (owner only)
router.post('/', authenticate, requireOwner, validate(createCourtSchema), createCourt);
router.put('/:id', authenticate, requireOwner, validate(updateCourtSchema), updateCourt);
router.patch('/:id/toggle', authenticate, requireOwner, toggleCourt);
router.post('/:id/photos', authenticate, requireOwner, uploadPhoto);

export default router;
