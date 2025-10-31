import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import {
  getMyProfileHandler,
  createTimeSlotsHandler,
  requestLeaveHandler,
  getMySlotsForDateHandler,
  checkHasActiveSlotsHandler,
  setAvailableSlotTimesHandler,
} from './therapist.controller';
import { createTimeSlotsSchema, requestLeaveSchema, getSlotsForDateSchema, setAvailableSlotTimesSchema } from './therapist.validation';

import prisma from '../../utils/prisma';

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
router.get('/me/slots/check', checkHasActiveSlotsHandler);
router.put(
  '/me/slots/available-times',
  validate({ body: setAvailableSlotTimesSchema.shape.body }),
  setAvailableSlotTimesHandler
);
router.post(
  '/me/slots',
  validate({ body: createTimeSlotsSchema.shape.body }), // <-- just the schema
  createTimeSlotsHandler
)
router.get(
  '/me/slots',
  validate({ query: getSlotsForDateSchema.shape.query }),
  getMySlotsForDateHandler
)
router.post('/me/leaves', validate({body : requestLeaveSchema.shape.body}), requestLeaveHandler);

export default router;