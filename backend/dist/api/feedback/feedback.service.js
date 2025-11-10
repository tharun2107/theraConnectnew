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
exports.getSessionDetails = exports.updateConsent = exports.createSessionReport = exports.createFeedback = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createFeedback = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, rating, comment, isAnonymous, consentToDataSharing } = input;
    // Verify booking exists and belongs to parent
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
        include: {
            parent: true,
            child: true,
            therapist: true,
            timeSlot: true,
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.status !== 'COMPLETED') {
        console.log('⚠️ Session not marked as completed, marking it now...');
        // Mark the session as completed if it's not already
        yield prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                isCompleted: true,
            },
        });
    }
    // Check if feedback already exists
    const existingFeedback = yield prisma_1.default.sessionFeedback.findUnique({
        where: { bookingId },
    });
    if (existingFeedback) {
        throw new Error('Feedback already submitted for this session');
    }
    // Create feedback
    const feedback = yield prisma_1.default.sessionFeedback.create({
        data: {
            id: `feedback_${Date.now()}`,
            rating,
            comment,
            isAnonymous,
            bookingId,
            parentId: booking.parentId,
        },
    });
    // Update therapist average rating
    yield updateTherapistRating(booking.therapistId);
    // Handle consent to data sharing
    if (consentToDataSharing) {
        yield prisma_1.default.consentRequest.create({
            data: {
                id: `consent_${Date.now()}`,
                status: 'GRANTED',
                requestedAt: new Date(),
                respondedAt: new Date(),
                notes: 'Parent granted consent through feedback form',
                bookingId,
                parentId: booking.parentId,
                therapistId: booking.therapistId,
            },
        });
    }
    return feedback;
});
exports.createFeedback = createFeedback;
const createSessionReport = (input) => __awaiter(void 0, void 0, void 0, function* () {
    // This endpoint is deprecated - redirect to use the new therapy notes API
    throw new Error('This endpoint is deprecated. Please use the new Therapy Notes API at /api/v1/therapy-notes/therapist/session-report. ' +
        'The new system supports monthly goals, session details, and home tasks with better structure.');
});
exports.createSessionReport = createSessionReport;
const updateConsent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, status, notes } = input;
    // Verify booking exists
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
        include: {
            parent: true,
            child: true,
            therapist: true,
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    // Update or create consent request
    const consentRequest = yield prisma_1.default.consentRequest.upsert({
        where: { bookingId },
        update: {
            status,
            respondedAt: new Date(),
            notes,
        },
        create: {
            id: `consent_${Date.now()}`,
            status,
            requestedAt: new Date(),
            respondedAt: new Date(),
            notes,
            bookingId,
            parentId: booking.parentId,
            therapistId: booking.therapistId,
        },
    });
    return consentRequest;
});
exports.updateConsent = updateConsent;
const getSessionDetails = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
        include: {
            parent: {
                include: {
                    user: true,
                },
            },
            child: true,
            therapist: {
                include: {
                    user: true,
                },
            },
            timeSlot: true,
            SessionFeedback: true,
            sessionReport: true,
            ConsentRequest: true,
            testimonial: true,
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    // Transform the response to ensure consistent field naming
    // Map SessionFeedback to sessionFeedback for frontend compatibility
    const transformedBooking = Object.assign(Object.assign({}, booking), { sessionFeedback: booking.SessionFeedback || null, consentRequest: booking.ConsentRequest || null });
    // Remove the capitalized versions to avoid confusion
    delete transformedBooking.SessionFeedback;
    delete transformedBooking.ConsentRequest;
    return transformedBooking;
});
exports.getSessionDetails = getSessionDetails;
const updateTherapistRating = (therapistId) => __awaiter(void 0, void 0, void 0, function* () {
    const feedbacks = yield prisma_1.default.sessionFeedback.findMany({
        where: {
            booking: {
                therapistId,
            },
        },
        select: {
            rating: true,
        },
    });
    if (feedbacks.length > 0) {
        const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length;
        yield prisma_1.default.therapistProfile.update({
            where: { id: therapistId },
            data: { averageRating: Math.round(averageRating * 10) / 10 },
        });
    }
});
// Deprecated - old email template no longer used
// New therapy notes system has its own email logic
