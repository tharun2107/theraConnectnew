"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = exports.getSlotsQuerySchema = void 0;
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
