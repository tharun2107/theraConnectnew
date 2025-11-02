"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const client_1 = require("@prisma/client");
const demo_controller_1 = require("./demo.controller");
const router = (0, express_1.Router)();
// Public routes (no auth required for booking)
router.get('/slots', demo_controller_1.getAvailableDemoSlotsHandler);
router.post('/bookings', demo_controller_1.createDemoBookingHandler);
// Admin-only routes
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.ADMIN]));
// Demo slot management
router.get('/admin/slots', demo_controller_1.getAdminDemoSlotsHandler);
router.post('/admin/slots', demo_controller_1.createAdminDemoSlotsHandler);
router.put('/admin/slots/:month/:year', demo_controller_1.updateAdminDemoSlotsHandler);
// Demo booking management
router.get('/admin/bookings', demo_controller_1.getDemoBookingsHandler);
router.get('/admin/bookings/history', demo_controller_1.getDemoBookingHistoryHandler);
router.post('/admin/bookings/:bookingId/zoom', demo_controller_1.createDemoZoomMeetingHandler);
router.put('/admin/bookings/:bookingId/notes', demo_controller_1.updateDemoBookingNotesHandler);
exports.default = router;
