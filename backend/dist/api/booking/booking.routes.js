"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const zoomController = __importStar(require("./zoom.controller"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// A parent can get slots for a therapist
router.get('/slots', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), (0, validate_middleware_1.validate)({ query: booking_validation_1.getSlotsQuerySchema.shape.query }), booking_controller_1.getAvailableSlotsHandler);
// A parent can create a booking
router.post('/', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), (0, validate_middleware_1.validate)({ body: booking_validation_1.createBookingSchema.shape.body }), booking_controller_1.createBookingHandler);
// Both parents and therapists can view their own bookings
router.get('/me', (0, auth_middleware_1.authorize)([client_1.Role.PARENT, client_1.Role.THERAPIST]), booking_controller_1.getMyBookingsHandler);
// Parents can view bookings for a specific therapist (to check availability)
router.get('/therapist/:therapistId', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), booking_controller_1.getTherapistBookingsHandler);
// Zoom meeting integration
// Therapist creates a Zoom meeting for a booking (stores meetingId/password)
router.post('/:bookingId/zoom/create', (0, auth_middleware_1.authorize)([client_1.Role.THERAPIST]), zoomController.createMeetingForBooking);
// Therapist toggles that host has started the session
router.post('/:bookingId/zoom/host-started', (0, auth_middleware_1.authorize)([client_1.Role.THERAPIST]), zoomController.markHostStarted);
// Get SDK signature for current user (role derived), blocked if parent and host not started
router.get('/:bookingId/zoom/signature', (0, auth_middleware_1.authorize)([client_1.Role.PARENT, client_1.Role.THERAPIST]), zoomController.getSignature);
// Mark session as completed (can be called by both parent and therapist)
router.post('/:bookingId/complete', (0, auth_middleware_1.authorize)([client_1.Role.PARENT, client_1.Role.THERAPIST]), booking_controller_1.markSessionCompletedHandler);
// Recurring booking routes (Parent only)
router.post('/recurring', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), booking_controller_1.createRecurringBookingHandler);
router.get('/recurring', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), booking_controller_1.getRecurringBookingsHandler);
router.get('/recurring/:recurringBookingId/sessions', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), booking_controller_1.getUpcomingSessionsHandler);
router.delete('/recurring/:recurringBookingId', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), booking_controller_1.cancelRecurringBookingHandler);
exports.default = router;
