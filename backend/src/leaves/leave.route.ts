import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import {
  requestLeaveHandler,
  getTherapistLeavesHandler,
  getTherapistLeaveBalanceHandler,
  getAllLeavesHandler,
  getLeaveDetailsHandler,
  processLeaveHandler
} from '../leaves/leave.controller';
import { Role } from '@prisma/client';
import { validate } from '../middleware/validate.middleware';
import { getLeaveByIdSchema, getLeaveRequestsSchema, processLeaveParamsSchema, processLeaveBodySchema, requestLeaveSchema } from './leave.validation';

// ============================================
// THERAPIST ROUTES
// ============================================

const therapistRouter = Router();

therapistRouter.use(authenticate);
therapistRouter.use(authorize([Role.THERAPIST]));

/**
 * POST /api/therapist/leaves
 * Request leave for a specific date
 * Body: { date: "YYYY-MM-DD", type: "CASUAL|SICK|FESTIVE|OPTIONAL", reason?: "..." }
 */
therapistRouter.post(
  '/leaves',
  validate({ body: requestLeaveSchema.shape.body }),
  requestLeaveHandler
);

/**
 * GET /api/therapist/leaves
 * Get all leave requests for the therapist
 */
therapistRouter.get(
  '/leaves',
  getTherapistLeavesHandler
);

/**
 * GET /api/therapist/leaves/balance
 * Get current leave balance for the therapist
 */
therapistRouter.get(
  '/leaves/balance',
  getTherapistLeaveBalanceHandler
);

// ============================================
// ADMIN ROUTES
// ============================================

const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize([Role.ADMIN]));

/**
 * GET /api/admin/leaves
 * Get all leave requests with optional status filter
 * Query params: status (optional) - PENDING, APPROVED, REJECTED
 */
adminRouter.get(
  '/leaves',
  validate({ query: getLeaveRequestsSchema.shape.query }),
  getAllLeavesHandler
);

/**
 * GET /api/admin/leaves/:leaveId
 * Get details of a specific leave request
 */
adminRouter.get(
  '/leaves/:leaveId',
  validate({ params: getLeaveByIdSchema.shape.params }),
  getLeaveDetailsHandler
);

/**
 * PUT /api/admin/leaves/:leaveId
 * Approve or reject a leave request
 * Body: { action: "APPROVE" | "REJECT", adminNotes?: "..." }
 */
adminRouter.put(
  '/leaves/:leaveId',
  validate({ params: processLeaveParamsSchema, body: processLeaveBodySchema }),
  processLeaveHandler
);

export { therapistRouter as therapistLeaveRoutes, adminRouter as adminLeaveRoutes };