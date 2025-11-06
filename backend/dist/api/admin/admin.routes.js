"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const admin_validation_1 = require("./admin.validation");
const leave_validation_1 = require("../leaves/leave.validation");
const leave_controller_1 = require("../leaves/leave.controller");
const router = (0, express_1.Router)();
// All routes in this file are protected and for Admins only
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.ADMIN]));
// Therapist management
router.get('/therapists', admin_controller_1.getAllTherapistsHandler);
router.get('/therapists/:therapistId/sessions', admin_controller_1.getTherapistSessionsHandler);
router.patch('/therapists/:therapistId/status', (0, validate_middleware_1.validate)(admin_validation_1.updateTherapistStatusSchema), admin_controller_1.updateTherapistStatusHandler);
// Children management
router.get('/children', admin_controller_1.getAllChildrenHandler);
router.get('/children/:childId/sessions', admin_controller_1.getChildSessionsHandler);
// Bookings management
router.get('/bookings', admin_controller_1.getAllBookingsHandler);
// Profile management
router.get('/profile', admin_controller_1.getProfileHandler);
// router.put('/profile', updateProfileHandler);
// Platform settings
router.get('/settings', admin_controller_1.getPlatformSettingsHandler);
router.put('/settings', admin_controller_1.updatePlatformSettingsHandler);
//leaves mgt
router.get('/leaves', (0, validate_middleware_1.validate)({ body: leave_validation_1.getLeaveRequestsSchema.shape.body }), leave_controller_1.getAllLeavesHandler);
/**
 * GET /api/admin/leaves/:leaveId
 * Get details of a specific leave request
 */
router.get('/leaves/:leaveId', (0, validate_middleware_1.validate)({ params: leave_validation_1.getLeaveByIdSchema.shape.params }), leave_controller_1.getLeaveDetailsHandler);
/**
 * PUT /api/admin/leaves/:leaveId
 * Approve or reject a leave request
 * Body: { action: "APPROVE" | "REJECT", adminNotes?: "..." }
 */
router.put('/leaves', (0, validate_middleware_1.validate)({ body: leave_validation_1.processLeaveSchema.shape.body }), leave_controller_1.processLeaveHandler);
exports.default = router;
