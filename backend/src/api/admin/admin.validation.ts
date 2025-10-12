import { z } from 'zod';
import { TherapistStatus } from '@prisma/client';

export const updateTherapistStatusSchema = {
  body: z.object({
    status: z.nativeEnum(TherapistStatus),
  }),
  params: z.object({
    therapistId: z.string().cuid(),
  }),
};