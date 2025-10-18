import { z } from 'zod';

export const childSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    age: z.number().int().positive(),
    address: z.string().optional(),
    condition: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateChildSchema = childSchema.partial();

export const childIdParamSchema = z.object({
  params: z.object({
    childId: z.string().cuid(),
  }),
});

export const updateParentProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  }),
});