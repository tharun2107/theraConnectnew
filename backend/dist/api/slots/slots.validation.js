"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookSlotSchema = exports.getAvailableSlotsSchema = exports.updateScheduleSchema = void 0;
const zod_1 = require("zod");
// For Admins/Therapists to update their schedule settings
exports.updateScheduleSchema = zod_1.z.object({
    body: zod_1.z.object({
        scheduleStartTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, expected HH:mm").optional(),
        slotDurationInMinutes: zod_1.z.number().int().positive().optional(),
    }),
});
// For Parents fetching available slots
exports.getAvailableSlotsSchema = zod_1.z.object({
    body: zod_1.z.object({
        therapistId: zod_1.z.string().cuid(),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
    }),
});
// For Parents booking a specific slot
exports.bookSlotSchema = zod_1.z.object({
    body: zod_1.z.object({
        timeSlotId: zod_1.z.string().cuid(),
        childId: zod_1.z.string().cuid(),
    }),
});
