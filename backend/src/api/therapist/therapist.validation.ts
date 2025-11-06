import { z } from 'zod';
import { LeaveType } from '@prisma/client';

const dateYMD = z.string()
  .transform((v) => {
    const trimmed = (v || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const m = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return trimmed; // do not throw here; let refine handle invalids
  })
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: 'Invalid date format, expected YYYY-MM-DD',
  });

export const createTimeSlotsSchema = z.object({
  body: z.object({
    date: dateYMD, // normalize to YYYY-MM-DD
    // Either therapist sends explicit slots (legacy) or requests generation and activation
    slots: z.array(z.object({
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
    })).optional(),
    generate: z.boolean().optional(),
    activateSlotIds: z.array(z.string().cuid()).optional(), // up to 10
  }),
});

export const requestLeaveSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    type: z.nativeEnum(LeaveType),
    reason: z.string().optional(),
  }),
});

export const getSlotsForDateSchema = z.object({
  query: z.object({
    date: dateYMD, // normalize to YYYY-MM-DD
  }),
});

export const publicSlotsSchema = z.object({
  params: z.object({ therapistId: z.string().cuid() }),
  query: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
});


// Validation schema for setting schedule
export const setScheduleSchema = z.object({
    body : z.object({
        selectedSlots: z
    .array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Time must be in HH:mm format (e.g., 09:00)"
    }))
    .length(8, { message: "You must select exactly 8 time slots" })
    .refine(
      (slots) => new Set(slots).size === slots.length,
      { message: "Duplicate time slots are not allowed" }
    )
    })
});

export type SetScheduleInput = z.infer<typeof setScheduleSchema>["body"];
