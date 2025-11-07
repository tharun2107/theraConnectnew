"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignature = exports.markHostStarted = exports.createMeetingForBooking = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const zoom_service_1 = require("../../services/zoom.service");
const createMeetingForBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        // Ensure the booking belongs to the therapist
        const booking = yield prisma_1.default.booking.findFirst({
            where: { id: bookingId, therapist: { userId: req.user.userId } },
            include: { timeSlot: true },
        });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        // If meeting already exists, return it
        if (booking.meetingId) {
            return res.status(200).json({ meetingId: booking.meetingId, password: booking.meetingPassword });
        }
        const startTimeIso = booking.timeSlot.startTime.toISOString();
        const duration = Math.max(15, Math.round((booking.timeSlot.endTime.getTime() - booking.timeSlot.startTime.getTime()) / 60000));
        const topic = `Therabee Session - ${booking.id}`;
        const meeting = yield (0, zoom_service_1.createRealMeeting)({ topic, startTimeIso, durationMinutes: duration });
        const updated = yield prisma_1.default.booking.update({
            where: { id: booking.id },
            data: { meetingId: meeting.meetingId, meetingPassword: meeting.password, zoomLink: meeting.joinUrl },
        });
        res.status(201).json({ meetingId: updated.meetingId, password: updated.meetingPassword });
    }
    catch (e) {
        res.status(400).json({ message: e.message || 'Failed to create meeting' });
    }
});
exports.createMeetingForBooking = createMeetingForBooking;
const markHostStarted = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield prisma_1.default.booking.findFirst({ where: { id: bookingId, therapist: { userId: req.user.userId } } });
        if (!booking)
            return res.status(404).json({ message: 'Booking not found' });
        yield prisma_1.default.booking.update({ where: { id: bookingId }, data: { hostStarted: true } });
        res.status(200).json({ message: 'Host started set' });
    }
    catch (e) {
        res.status(400).json({ message: e.message || 'Failed to update host started' });
    }
});
exports.markHostStarted = markHostStarted;
const getSignature = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const booking = yield prisma_1.default.booking.findUnique({ where: { id: bookingId } });
        if (!booking || !booking.meetingId)
            return res.status(404).json({ message: 'Meeting not ready' });
        // Parents can only join if host started
        if (req.user.role === client_1.Role.PARENT && !booking.hostStarted) {
            return res.status(403).json({ message: 'Host has not started the meeting yet' });
        }
        const role = req.user.role === client_1.Role.THERAPIST ? 1 : 0;
        const signature = (0, zoom_service_1.generateMeetingSdkSignature)(booking.meetingId, role);
        const sdkKey = (0, zoom_service_1.getSdkKey)();
        res.status(200).json({ signature, sdkKey, meetingNumber: booking.meetingId, password: booking.meetingPassword });
    }
    catch (e) {
        res.status(400).json({ message: e.message || 'Failed to generate signature' });
    }
});
exports.getSignature = getSignature;
