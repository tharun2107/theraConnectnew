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
  getPlatformSettingsHandler,
  updatePlatformSettingsHandler
} from './admin.controller';
import { updateTherapistStatusSchema } from './admin.validation';
import { getLeaveByIdSchema, getLeaveRequestsSchema, processLeaveSchema } from '../leaves/leave.validation';
import { getAllLeavesHandler, getLeaveDetailsHandler, processLeaveHandler } from '../leaves/leave.controller';

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
// router.put('/profile', updateProfileHandler);

// Platform settings
router.get('/settings', getPlatformSettingsHandler);
router.put('/settings', updatePlatformSettingsHandler);

//leaves mgt
router.get(
  '/leaves',
  validate({ body: getLeaveRequestsSchema.shape.body }),
  getAllLeavesHandler
);

/**
 * GET /api/admin/leaves/:leaveId
 * Get details of a specific leave request
 */
router.get(
  '/leaves/:leaveId',
  validate({ params: getLeaveByIdSchema.shape.params }),
  getLeaveDetailsHandler
);

/**
 * PUT /api/admin/leaves/:leaveId
 * Approve or reject a leave request
 * Body: { action: "APPROVE" | "REJECT", adminNotes?: "..." }
 */
router.put(
  '/leaves',
  validate({ body: processLeaveSchema.shape.body }),
  processLeaveHandler
);

export default router;