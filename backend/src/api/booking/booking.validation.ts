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