"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAvailableSlotTimesSchema = exports.publicSlotsSchema = exports.getSlotsForDateSchema = exports.requestLeaveSchema = exports.createTimeSlotsSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const dateYMD = zod_1.z.string()
    .transform((v) => {
    const trimmed = (v || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed))
        return trimmed;
    const m = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m)
        return `${m[3]}-${m[2]}-${m[1]}`;
    return trimmed; // do not throw here; let refine handle invalids
})
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: 'Invalid date format, expected YYYY-MM-DD',
});
exports.createTimeSlotsSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: dateYMD, // normalize to YYYY-MM-DD
        // Either therapist sends explicit slots (legacy) or requests generation and activation
        slots: zod_1.z.array(zod_1.z.object({
            startTime: zod_1.z.string().datetime(),
            endTime: zod_1.z.string().datetime(),
        })).optional(),
        generate: zod_1.z.boolean().optional(),
        activateSlotIds: zod_1.z.array(zod_1.z.string().cuid()).optional(), // up to 10
    }),
});
exports.requestLeaveSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        type: zod_1.z.nativeEnum(client_1.LeaveType),
        reason: zod_1.z.string().optional(),
    }),
});
exports.getSlotsForDateSchema = zod_1.z.object({
    query: zod_1.z.object({
        date: dateYMD, // normalize to YYYY-MM-DD
    }),
});
exports.publicSlotsSchema = zod_1.z.object({
    params: zod_1.z.object({ therapistId: zod_1.z.string().cuid() }),
    query: zod_1.z.object({ date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
});
exports.setAvailableSlotTimesSchema = zod_1.z.object({
    body: zod_1.z.object({
        slotTimes: zod_1.z.array(zod_1.z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)).min(1).max(8),
    }),
});
