import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingById
} from '../controllers/bookings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createBookingSchema } from '../schemas/booking.schema.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

export default router;
