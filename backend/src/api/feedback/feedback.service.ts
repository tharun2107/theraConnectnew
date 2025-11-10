import { email } from 'zod'
import prisma from '../../utils/prisma'
import { CreateFeedbackInput, CreateSessionReportInput, UpdateConsentInput } from './feedback.validation'
import { sendemail } from '../../services/email.services'


export const createFeedback = async (input: CreateFeedbackInput) => {
  const { bookingId, rating, comment, isAnonymous, consentToDataSharing } = input

  // Verify booking exists and belongs to parent
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: true,
      child: true,
      therapist: true,
      timeSlot: true,
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  if (booking.status !== 'COMPLETED') {
    console.log('⚠️ Session not marked as completed, marking it now...')
    // Mark the session as completed if it's not already
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        isCompleted: true,
      } as any,
    })
  }

  // Check if feedback already exists
  const existingFeedback = await (prisma as any).sessionFeedback.findUnique({
    where: { bookingId },
  })

  if (existingFeedback) {
    throw new Error('Feedback already submitted for this session')
  }

  // Create feedback
  const feedback = await (prisma as any).sessionFeedback.create({
    data: {
      id: `feedback_${Date.now()}`,
      rating,
      comment,
      isAnonymous,
      bookingId,
      parentId: booking.parentId,
    },
  })

  // Update therapist average rating
  await updateTherapistRating(booking.therapistId)

  // Handle consent to data sharing
  if (consentToDataSharing) {
    await (prisma as any).consentRequest.create({
      data: {
        id: `consent_${Date.now()}`,
        status: 'GRANTED',
        requestedAt: new Date(),
        respondedAt: new Date(),
        notes: 'Parent granted consent through feedback form',
        bookingId,
        parentId: booking.parentId,
        therapistId: booking.therapistId,
      },
    })
  }

  return feedback
}

export const createSessionReport = async (input: CreateSessionReportInput) => {
  // This endpoint is deprecated - redirect to use the new therapy notes API
  throw new Error(
    'This endpoint is deprecated. Please use the new Therapy Notes API at /api/v1/therapy-notes/therapist/session-report. ' +
    'The new system supports monthly goals, session details, and home tasks with better structure.'
  )
}

export const updateConsent = async (input: UpdateConsentInput) => {
  const { bookingId, status, notes } = input

  // Verify booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: true,
      child: true,
      therapist: true,
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  // Update or create consent request
  const consentRequest = await (prisma as any).consentRequest.upsert({
    where: { bookingId },
    update: {
      status,
      respondedAt: new Date(),
      notes,
    },
    create: {
      id: `consent_${Date.now()}`,
      status,
      requestedAt: new Date(),
      respondedAt: new Date(),
      notes,
      bookingId,
      parentId: booking.parentId,
      therapistId: booking.therapistId,
    },
  })

  return consentRequest
}

export const getSessionDetails = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: {
        include: {
          user: true,
        },
      },
      child: true,
      therapist: {
        include: {
          user: true,
        },
      },
      timeSlot: true,
      SessionFeedback: true,
      sessionReport: true,
      ConsentRequest: true,
      testimonial: true,
    } as any,
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  // Transform the response to ensure consistent field naming
  // Map SessionFeedback to sessionFeedback for frontend compatibility
  const transformedBooking = {
    ...booking,
    sessionFeedback: booking.SessionFeedback || null,
    consentRequest: booking.ConsentRequest || null,
  }

  // Remove the capitalized versions to avoid confusion
  delete (transformedBooking as any).SessionFeedback
  delete (transformedBooking as any).ConsentRequest

  return transformedBooking
}

const updateTherapistRating = async (therapistId: string) => {
  const feedbacks = await (prisma as any).sessionFeedback.findMany({
    where: {
      booking: {
        therapistId,
      },
    },
    select: {
      rating: true,
    },
  })

  if (feedbacks.length > 0) {
    const averageRating = feedbacks.reduce((sum: number, feedback: any) => sum + feedback.rating, 0) / feedbacks.length

    await prisma.therapistProfile.update({
      where: { id: therapistId },
      data: { averageRating: Math.round(averageRating * 10) / 10 },
    })
  }
}

// Deprecated - old email template no longer used
// New therapy notes system has its own email logic