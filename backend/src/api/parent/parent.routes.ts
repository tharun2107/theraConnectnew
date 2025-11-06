import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import {
  getMyProfileHandler,
  getMyChildrenHandler,
  addChildHandler,
  updateChildHandler,
  deleteChildHandler,
  getActiveTherapistsHandler,
} from './parent.controller';
import { childIdParamSchema, childSchema, updateChildSchema } from './parent.validation';
import { cancelRecurringBookingSchema, createBookingSchema, createRecurringBookingSchema, getRecurringBookingSchema, getSlotsQuerySchema } from '../booking/booking.validation';
import { cancelRecurringBookingHandler, createRecurringBookingHandler, getRecurringBookingsHandler, getUpcomingSessionsHandler } from '../booking/booking.controller';

const router = Router();

// All routes are for authenticated Parents only
router.use(authenticate, authorize([Role.PARENT]));

router.get('/me/profile', getMyProfileHandler);

// Children CRUD
router.get('/me/children', getMyChildrenHandler);
router.post('/me/children', validate({body : childSchema.shape.body}), addChildHandler);
router.put('/me/children/:childId', validate({ body: updateChildSchema.shape.body, params: childIdParamSchema.shape.params }), updateChildHandler);
router.delete('/me/children/:childId', validate({ params: childIdParamSchema.shape.params }), deleteChildHandler);

// Public list of active therapists for parents
router.get('/therapists', getActiveTherapistsHandler);


router.post('/recurring-bookings',validate({ body: createRecurringBookingSchema.shape.body }),createRecurringBookingHandler);

/**
 * GET /api/parent/recurring-bookings
 * Get all recurring bookings for the parent
 */
router.get('/recurring-bookings/:recurringBookingId',validate({params:getRecurringBookingSchema.shape.params}),getRecurringBookingsHandler);

/**
 * GET /api/parent/recurring-bookings/:recurringBookingId/sessions
 * Get upcoming sessions for a specific recurring booking
 */
router.get('/recurring-bookings/:recurringBookingId/sessions',validate({ params: getRecurringBookingSchema.shape.params }),getUpcomingSessionsHandler);

/**
 * DELETE /api/parent/recurring-bookings/:recurringBookingId
 * Cancel a recurring booking (cancels all future sessions)
 */
router.delete('/recurring-bookings/:recurringBookingId',validate({body : cancelRecurringBookingSchema.shape.body}),cancelRecurringBookingHandler);

export default router;