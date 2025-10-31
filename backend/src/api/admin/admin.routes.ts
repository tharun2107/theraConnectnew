import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import { 
  getAllTherapistsHandler, 
  updateTherapistStatusHandler,
  getTherapistSessionsHandler,
  getAllChildrenHandler,
  getChildSessionsHandler,
  getAllBookingsHandler,
  getProfileHandler,
  updateProfileHandler,
  getPlatformSettingsHandler,
  updatePlatformSettingsHandler,
  listLeaveRequestsHandler,
  approveLeaveRequestHandler,
  rejectLeaveRequestHandler
} from './admin.controller';
import { updateTherapistStatusSchema } from './admin.validation';

const router = Router();

// All routes in this file are protected and for Admins only
router.use(authenticate, authorize([Role.ADMIN]));

// Therapist management
router.get('/therapists', getAllTherapistsHandler);
router.get('/therapists/:therapistId/sessions', getTherapistSessionsHandler);
router.patch('/therapists/:therapistId/status', validate(updateTherapistStatusSchema), updateTherapistStatusHandler);

// Children management
router.get('/children', getAllChildrenHandler);
router.get('/children/:childId/sessions', getChildSessionsHandler);

// Bookings management
router.get('/bookings', getAllBookingsHandler);

// Profile management
router.get('/profile', getProfileHandler);
router.put('/profile', updateProfileHandler);

// Platform settings
router.get('/settings', getPlatformSettingsHandler);
router.put('/settings', updatePlatformSettingsHandler);

// Leave requests management
router.get('/leaves', listLeaveRequestsHandler);
router.post('/leaves/:leaveId/approve', approveLeaveRequestHandler);
router.post('/leaves/:leaveId/reject', rejectLeaveRequestHandler);

export default router;