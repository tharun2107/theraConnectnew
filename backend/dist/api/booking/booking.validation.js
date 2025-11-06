"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecurringBookingSchema = exports.cancelRecurringBookingSchema = exports.createRecurringBookingSchema = exports.createBookingSchema = exports.getSlotsQuerySchema = void 0;
const zod_1 = require("zod");
const dateYMD = zod_1.z.string()
    .transform((v) => (v || '').slice(0, 10))
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), { message: 'Invalid date format, expected YYYY-MM-DD' });
exports.getSlotsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        therapistId: zod_1.z.string().cuid(),
        date: dateYMD,
    }),
});
exports.createBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        childId: zod_1.z.string().min(1),
        timeSlotId: zod_1.z.string().min(1),
    }),
});
/**
 * Validation schema for creating recurring booking
 */
exports.createRecurringBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        therapistId: zod_1.z.string().min(1, "Therapist ID is required"),
        childId: zod_1.z.string().min(1, "Child ID is required"),
        slotTime: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
            message: "Slot time must be in HH:mm format (e.g., 09:00)"
        }),
        startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
            message: "Start date must be in YYYY-MM-DD format"
        })
    }).refine((data) => new Date(data.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Start date cannot be in the past",
        path: ["startDate"]
    })
});
/**
 * Validation schema for cancelling recurring booking
 */
exports.cancelRecurringBookingSchema = zod_1.z.object({
    body: zod_1.z.object({
        recurringBookingId: zod_1.z.string().min(1, "Recurring booking ID is required")
    })
});
/**
 * Validation schema for getting recurring booking details
 */
exports.getRecurringBookingSchema = zod_1.z.object({
    params: zod_1.z.object({
        recurringBookingId: zod_1.z.string().min(1, "Recurring booking ID is required")
    })
});
