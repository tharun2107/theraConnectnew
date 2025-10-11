import type { Request, Response } from 'express'
import * as feedbackService from './feedback.service'
import { createFeedbackSchema, createSessionReportSchema, updateConsentSchema } from './feedback.validation'

const handleServiceError = (res: Response, error: any) => {
  const isConflict = error.message?.includes('already')
  const isNotFound = error.message?.includes('not found')
  const isValidation = error.message?.includes('required') || error.message?.includes('must be')
  
  let status = 500
  if (isNotFound) status = 404
  else if (isConflict) status = 409
  else if (isValidation) status = 400
  
  return res.status(status).json({ message: error.message })
}

export const createFeedbackHandler = async (req: Request, res: Response) => {
  try {
    console.log('📝 Creating feedback:', req.body)
    const feedback = await feedbackService.createFeedback(req.body)
    console.log('✅ Feedback created successfully:', feedback)
    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback 
    })
  } catch (error) {
    console.error('❌ Error creating feedback:', error)
    handleServiceError(res, error)
  }
}

export const createSessionReportHandler = async (req: Request, res: Response) => {
  try {
    console.log('📋 Creating session report:', req.body)
    const report = await feedbackService.createSessionReport(req.body)
    console.log('✅ Session report created successfully:', report)
    res.status(201).json({ 
      message: 'Session report created successfully', 
      report 
    })
  } catch (error) {
    console.error('❌ Error creating session report:', error)
    handleServiceError(res, error)
  }
}

export const updateConsentHandler = async (req: Request, res: Response) => {
  try {
    const consent = await feedbackService.updateConsent(req.body)
    res.status(200).json({ 
      message: 'Consent updated successfully', 
      consent 
    })
  } catch (error) {
    handleServiceError(res, error)
  }
}

export const getSessionDetailsHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const sessionDetails = await feedbackService.getSessionDetails(bookingId)
    res.status(200).json({ sessionDetails })
  } catch (error) {
    handleServiceError(res, error)
  }
}
