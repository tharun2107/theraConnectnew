import { z } from 'zod'

export const createFeedbackSchema = {
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().optional(),
    isAnonymous: z.boolean().default(false),
    consentToDataSharing: z.boolean().default(false),
  }),
}

export const createSessionReportSchema = {
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    sessionExperience: z.string().min(1, 'Session experience is required'),
    childPerformance: z.string().optional(),
    improvements: z.string().optional(),
    medication: z.string().optional(),
    recommendations: z.string().optional(),
    nextSteps: z.string().optional(),
  }),
}

export const updateConsentSchema = {
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    status: z.enum(['GRANTED', 'DENIED']),
    notes: z.string().optional(),
  }),
}

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema.body>
export type CreateSessionReportInput = z.infer<typeof createSessionReportSchema.body>
export type UpdateConsentInput = z.infer<typeof updateConsentSchema.body>
