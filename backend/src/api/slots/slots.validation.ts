import { z } from 'zod';

// For Admins/Therapists to update their schedule settings
export const updateScheduleSchema = z.object({
  body: z.object({
    scheduleStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, expected HH:mm").optional(),
    slotDurationInMinutes: z.number().int().positive().optional(),
  }),
});

// For Parents fetching available slots
export const getAvailableSlotsSchema = z.object({
  body: z.object({
    therapistId: z.string().cuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"),
  }),
});

// For Parents booking a specific slot
export const bookSlotSchema = z.object({
  body: z.object({
    timeSlotId: z.string().cuid(),
    childId: z.string().cuid(),
  }),
});
