import prisma from '../../utils/prisma'
import { CreateFeedbackInput, CreateSessionReportInput, UpdateConsentInput } from './feedback.validation'
import { sendEmail } from '../../services/notification.service'

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
      },
    })
  }

  // Check if feedback already exists
  const existingFeedback = await prisma.sessionFeedback.findUnique({
    where: { bookingId },
  })

  if (existingFeedback) {
    throw new Error('Feedback already submitted for this session')
  }

  // Create feedback
  const feedback = await prisma.sessionFeedback.create({
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
    await prisma.consentRequest.create({
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
  const { bookingId, sessionExperience, childPerformance, improvements, medication, recommendations, nextSteps } = input

  // Verify booking exists and belongs to therapist
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      child: true,
      therapist: { include: { user: true } },
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
      },
    })
  }

  // Check if report already exists
  const existingReport = await prisma.sessionReport.findUnique({
    where: { bookingId },
  })

  if (existingReport) {
    throw new Error('Session report already exists for this session')
  }

  // Create session report
  const report = await prisma.sessionReport.create({
    data: {
      id: `report_${Date.now()}`,
      sessionExperience,
      childPerformance,
      improvements,
      medication,
      recommendations,
      nextSteps,
      bookingId,
      therapistId: booking.therapistId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Send email to parent
  try {
    await sendSessionReportEmail(booking.parent.user.email, booking.child.name, report, booking.therapist.name)
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't throw error - report creation should succeed even if email fails
  }

  return report
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
  const consentRequest = await prisma.consentRequest.upsert({
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
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  return booking
}

const updateTherapistRating = async (therapistId: string) => {
  const feedbacks = await prisma.sessionFeedback.findMany({
    where: {
      Booking: {
        therapistId,
      },
    },
    select: {
      rating: true,
    },
  })

  if (feedbacks.length > 0) {
    const averageRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length

    await prisma.therapistProfile.update({
      where: { id: therapistId },
      data: { averageRating: Math.round(averageRating * 10) / 10 },
    })
  }
}

const sendSessionReportEmail = async (parentEmail: string, childName: string, report: any, therapistName: string) => {
  const emailContent = `
    <h2>Session Report for ${childName}</h2>
    <p>Dear Parent,</p>
    <p>Dr. ${therapistName} has completed the session report for ${childName}. Here are the details:</p>
    
    <h3>Session Experience</h3>
    <p>${report.sessionExperience}</p>
    
    ${report.childPerformance ? `
    <h3>Child Performance</h3>
    <p>${report.childPerformance}</p>
    ` : ''}
    
    ${report.improvements ? `
    <h3>Improvements</h3>
    <p>${report.improvements}</p>
    ` : ''}
    
    ${report.medication ? `
    <h3>Medication Notes</h3>
    <p>${report.medication}</p>
    ` : ''}
    
    ${report.recommendations ? `
    <h3>Recommendations</h3>
    <p>${report.recommendations}</p>
    ` : ''}
    
    ${report.nextSteps ? `
    <h3>Next Steps</h3>
    <p>${report.nextSteps}</p>
    ` : ''}
    
    <p>Best regards,<br>TheraConnect Team</p>
  `

  await sendEmail({
    to: parentEmail,
    subject: `Session Report for ${childName} - TheraConnect`,
    html: emailContent,
  })
}
