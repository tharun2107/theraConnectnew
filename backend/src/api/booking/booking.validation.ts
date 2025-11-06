import { z } from 'zod';

const dateYMD = z.string()
  .transform((v) => (v || '').slice(0, 10))
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), { message: 'Invalid date format, expected YYYY-MM-DD' });

export const getSlotsQuerySchema = z.object({
  query: z.object({
    therapistId: z.string().cuid(),
    date: dateYMD,
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    childId: z.string().min(1),
    timeSlotId: z.string().min(1),
  }),
});


 
/**
 * Validation schema for creating recurring booking
 */
export const createRecurringBookingSchema = z.object({
    body : z.object({
        therapistId: z.string().min(1, "Therapist ID is required"),
  childId: z.string().min(1, "Child ID is required"),
  slotTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Slot time must be in HH:mm format (e.g., 09:00)"
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Start date must be in YYYY-MM-DD format"
  })
}).refine(
  (data) => new Date(data.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: "Start date cannot be in the past",
    path: ["startDate"]
  })
});

/**
 * Validation schema for cancelling recurring booking
 */
export const cancelRecurringBookingSchema = z.object({
  body : z.object({
    recurringBookingId: z.string().min(1, "Recurring booking ID is required")
  })
});

/**
 * Validation schema for getting recurring booking details
 */
export const getRecurringBookingSchema = z.object({
    params : z.object({
        recurringBookingId: z.string().min(1, "Recurring booking ID is required")
    })
});

export type CreateRecurringBookingInput = z.infer<typeof createRecurringBookingSchema>['body'];
export type CancelRecurringBookingInput = z.infer<typeof cancelRecurringBookingSchema>['body'];
export type GetRecurringBookingInput = z.infer<typeof getRecurringBookingSchema>['params'];



