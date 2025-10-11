import { Router } from 'express'
import { createFeedbackHandler, createSessionReportHandler, updateConsentHandler, getSessionDetailsHandler } from './feedback.controller'
import { validate } from '../../middleware/validate.middleware'
import { createFeedbackSchema, createSessionReportSchema, updateConsentSchema } from './feedback.validation'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Feedback API is working', timestamp: new Date().toISOString() })
})

// All routes require authentication
router.use(authenticate)

// Parent routes
router.post('/feedback', validate(createFeedbackSchema), createFeedbackHandler)
router.put('/consent', validate(updateConsentSchema), updateConsentHandler)

// Therapist routes
router.post('/session-report', validate(createSessionReportSchema), createSessionReportHandler)

// Common routes
router.get('/session/:bookingId', getSessionDetailsHandler)

export default router
