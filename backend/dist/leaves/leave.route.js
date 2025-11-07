"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLeaveRoutes = exports.therapistLeaveRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const leave_controller_1 = require("../leaves/leave.controller");
const client_1 = require("@prisma/client");
const validate_middleware_1 = require("../middleware/validate.middleware");
const leave_validation_1 = require("./leave.validation");
// ============================================
// THERAPIST ROUTES
// ============================================
const therapistRouter = (0, express_1.Router)();
exports.therapistLeaveRoutes = therapistRouter;
therapistRouter.use(auth_middleware_1.authenticate);
therapistRouter.use((0, auth_middleware_2.authorize)([client_1.Role.THERAPIST]));
/**
 * POST /api/therapist/leaves
 * Request leave for a specific date
 * Body: { date: "YYYY-MM-DD", type: "CASUAL|SICK|FESTIVE|OPTIONAL", reason?: "..." }
 */
therapistRouter.post('/leaves', (0, validate_middleware_1.validate)({ body: leave_validation_1.requestLeaveSchema.shape.body }), leave_controller_1.requestLeaveHandler);
/**
 * GET /api/therapist/leaves
 * Get all leave requests for the therapist
 */
therapistRouter.get('/leaves', leave_controller_1.getTherapistLeavesHandler);
/**
 * GET /api/therapist/leaves/balance
 * Get current leave balance for the therapist
 */
therapistRouter.get('/leaves/balance', leave_controller_1.getTherapistLeaveBalanceHandler);
// ============================================
// ADMIN ROUTES
// ============================================
const adminRouter = (0, express_1.Router)();
exports.adminLeaveRoutes = adminRouter;
adminRouter.use(auth_middleware_1.authenticate);
adminRouter.use((0, auth_middleware_2.authorize)([client_1.Role.ADMIN]));
/**
 * GET /api/admin/leaves
 * Get all leave requests with optional status filter
 * Query params: status (optional) - PENDING, APPROVED, REJECTED
 */
adminRouter.get('/leaves', (0, validate_middleware_1.validate)({ query: leave_validation_1.getLeaveRequestsSchema.shape.query }), leave_controller_1.getAllLeavesHandler);
/**
 * GET /api/admin/leaves/:leaveId
 * Get details of a specific leave request
 */
adminRouter.get('/leaves/:leaveId', (0, validate_middleware_1.validate)({ params: leave_validation_1.getLeaveByIdSchema.shape.params }), leave_controller_1.getLeaveDetailsHandler);
/**
 * PUT /api/admin/leaves/:leaveId
 * Approve or reject a leave request
 * Body: { action: "APPROVE" | "REJECT", adminNotes?: "..." }
 */
adminRouter.put('/leaves/:leaveId', (0, validate_middleware_1.validate)({ params: leave_validation_1.processLeaveParamsSchema, body: leave_validation_1.processLeaveBodySchema }), leave_controller_1.processLeaveHandler);
