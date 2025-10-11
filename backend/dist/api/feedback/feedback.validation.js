"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConsentSchema = exports.createSessionReportSchema = exports.createFeedbackSchema = void 0;
const zod_1 = require("zod");
exports.createFeedbackSchema = {
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, 'Booking ID is required'),
        rating: zod_1.z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
        comment: zod_1.z.string().optional(),
        isAnonymous: zod_1.z.boolean().default(false),
        consentToDataSharing: zod_1.z.boolean().default(false),
    }),
};
exports.createSessionReportSchema = {
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, 'Booking ID is required'),
        sessionExperience: zod_1.z.string().min(1, 'Session experience is required'),
        childPerformance: zod_1.z.string().optional(),
        improvements: zod_1.z.string().optional(),
        medication: zod_1.z.string().optional(),
        recommendations: zod_1.z.string().optional(),
        nextSteps: zod_1.z.string().optional(),
    }),
};
exports.updateConsentSchema = {
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, 'Booking ID is required'),
        status: zod_1.z.enum(['GRANTED', 'DENIED']),
        notes: zod_1.z.string().optional(),
    }),
};
