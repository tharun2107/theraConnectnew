import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import {
  getAvailableSlotsHandler,
  createBookingHandler,
  getMyBookingsHandler,
} from './booking.controller';
import { getSlotsQuerySchema, createBookingSchema } from './booking.validation';

const router = Router();
router.use(authenticate);

// A parent can get slots for a therapist
router.get(
  '/slots',
  authorize([Role.PARENT]),
  validate({ query: getSlotsQuerySchema.shape.query }),
  getAvailableSlotsHandler
);

// A parent can create a booking
router.post('/', authorize([Role.PARENT]), validate({ body: createBookingSchema.shape.body }), createBookingHandler);

// Both parents and therapists can view their own bookings
router.get('/me', authorize([Role.PARENT, Role.THERAPIST]), getMyBookingsHandler);

export default router;