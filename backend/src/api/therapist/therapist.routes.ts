import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import {
  getMyProfileHandler,
  createTimeSlotsHandler,
  getMySlotsForDateHandler,
  setScheduleHandler,
  getTimeSlotOptionsHandler,
  getCurrentScheduleHandler,
  updateScheduleHandler,
} from './therapist.controller';
import { createTimeSlotsSchema, getSlotsForDateSchema, setScheduleSchema } from './therapist.validation';
import { requestLeaveSchema } from '../leaves/leave.validation';
import { getTherapistLeavesHandler } from '../leaves/leave.controller';

import { requestLeaveHandler } from '../leaves/leave.controller';

const prisma = new PrismaClient();

const router = Router();

// Public route for listing active therapists - MUST be before auth middleware
router.get('/public', async (req, res) => {
  try {
    console.log('Public therapists endpoint hit!'); // Debug log
    const therapists = await prisma.therapistProfile.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        specialization: true,
        experience: true,
        baseCostPerSession: true,
        averageRating: true,
      },
    });
    console.log('Found therapists:', therapists.length); // Debug log
    res.json(therapists);
  } catch (error: any) {
    console.error('Error in public therapists endpoint:', error); // Debug log
    res.status(500).json({ message: error.message });
  }
});

// Test route to verify public access
router.get('/test', (req, res) => {
  res.json({ message: 'Public test route works!' });
});

// Protected routes for therapists
router.use(authenticate, authorize([Role.THERAPIST]));

router.get('/me/profile', getMyProfileHandler);
router.post('/me/slots',validate({ body: createTimeSlotsSchema.shape.body }), createTimeSlotsHandler)
router.get('/me/slots',validate({ query: getSlotsForDateSchema.shape.query }),getMySlotsForDateHandler)
// router.post('/me/leaves', validate({body : requestLeaveSchema.shape.body}), requestLeaveHandler);

router.get('/schedule/options', getTimeSlotOptionsHandler);
router.get('/schedule', getCurrentScheduleHandler);
router.post('/schedule', validate({body : setScheduleSchema.shape.body}), setScheduleHandler);
router.put('/schedule', validate({}), updateScheduleHandler);

router.post(
  '/leaves',
  validate({ body: requestLeaveSchema.shape.body }),
  requestLeaveHandler
);

/**
 * GET /api/therapist/leaves
 * Get all leave requests for the therapist
 */
router.get(
  '/leaves',
  getTherapistLeavesHandler
);


export default router;