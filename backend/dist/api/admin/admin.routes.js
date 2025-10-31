"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const admin_validation_1 = require("./admin.validation");
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
router.put('/profile', admin_controller_1.updateProfileHandler);
// Platform settings
router.get('/settings', admin_controller_1.getPlatformSettingsHandler);
router.put('/settings', admin_controller_1.updatePlatformSettingsHandler);
// Leave requests management
router.get('/leaves', admin_controller_1.listLeaveRequestsHandler);
router.post('/leaves/:leaveId/approve', admin_controller_1.approveLeaveRequestHandler);
router.post('/leaves/:leaveId/reject', admin_controller_1.rejectLeaveRequestHandler);
exports.default = router;
