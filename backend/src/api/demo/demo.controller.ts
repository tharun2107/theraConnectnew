import type { Request, Response } from 'express'
import * as demoService from './demo.service'
import { sendemail } from '../../services/email.services'
import { createRealMeeting } from '../../services/zoom.service'

// Get available demo slots (public)
export const getAvailableDemoSlotsHandler = async (req: Request, res: Response) => {
  try {
    const { timezone } = req.query // User's timezone
    const slots = await demoService.getAvailableDemoSlots(timezone as string)
    res.status(200).json(slots)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve demo slots' })
  }
}

// Create demo booking (public)
export const createDemoBookingHandler = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, reason, slotDate, slotHour, slotTimeString } = req.body

    // Validate required fields
    if (!name || !mobile || !email || !reason || !slotDate || slotHour === undefined || !slotTimeString) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const booking = await demoService.createDemoBooking({
      name,
      mobile,
      email,
      reason,
      slotDate,
      slotHour,
      slotTimeString,
    })

    // Send confirmation email to user
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Demo Session Confirmed - TheraConnect</h2>
        <p>Dear ${name},</p>
        <p>Thank you for booking a demo session with TheraConnect!</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Demo Session Details:</h3>
          <p><strong>Date:</strong> ${new Date(slotDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${slotTimeString}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>We will send you a Zoom link closer to your scheduled time.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>TheraConnect Team</p>
      </div>
    `

    await sendemail(email, 'Demo Session Confirmation', emailHtml, 'Demo Session Confirmation - TheraConnect')

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER
    if (adminEmail) {
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">New Demo Booking - TheraConnect</h2>
          <p>A new demo session has been booked:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
            <p><strong>Date:</strong> ${new Date(slotDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${slotTimeString}</p>
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>Please log in to the admin dashboard to manage this booking.</p>
        </div>
      `
      await sendemail(adminEmail, 'New Demo Booking', adminEmailHtml, 'New Demo Booking - TheraConnect')
    }

    res.status(201).json(booking)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create demo booking' })
  }
}

// Create Zoom meeting for demo booking (admin only)
export const createDemoZoomMeetingHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const booking = await demoService.getDemoBookingById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: 'Demo booking not found' })
    }

    if (booking.meetingId) {
      return res.status(200).json({
        meetingId: booking.meetingId,
        password: booking.meetingPassword,
        zoomLink: booking.zoomLink,
      })
    }

    // Create Zoom meeting
    const slotDateTime = new Date(booking.slotDate)
    slotDateTime.setHours(booking.slotHour, 0, 0, 0)

    const meeting = await createRealMeeting({
      topic: `TheraConnect Demo Session - ${booking.name}`,
      startTimeIso: slotDateTime.toISOString(),
      durationMinutes: 60, // 1 hour demo
    })

    // Update booking with meeting details
    const updated = await demoService.updateDemoBookingZoomDetails(bookingId, {
      meetingId: meeting.meetingId,
      meetingPassword: meeting.password,
      zoomLink: meeting.joinUrl,
    })

    // Send Zoom link email to user
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Your Demo Session Zoom Link - TheraConnect</h2>
        <p>Dear ${booking.name},</p>
        <p>Your demo session with TheraConnect is ready!</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details:</h3>
          <p><strong>Date:</strong> ${new Date(booking.slotDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.slotTimeString}</p>
          <p><strong>Meeting ID:</strong> ${meeting.meetingId}</p>
          <p><strong>Password:</strong> ${meeting.password}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meeting.joinUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Join Demo Session
          </a>
        </div>
        <p>Click the button above or use this link: <a href="${meeting.joinUrl}">${meeting.joinUrl}</a></p>
        <p>Best regards,<br>TheraConnect Team</p>
      </div>
    `

    await sendemail(booking.email, 'Your Demo Session Zoom Link', emailHtml, 'Your Demo Session Zoom Link - TheraConnect')

    res.status(201).json({
      meetingId: updated.meetingId,
      password: updated.meetingPassword,
      zoomLink: updated.zoomLink,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create Zoom meeting' })
  }
}

// Get all demo bookings (admin only)
export const getDemoBookingsHandler = async (req: Request, res: Response) => {
  try {
    const bookings = await demoService.getAllDemoBookings()
    res.status(200).json(bookings)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve demo bookings' })
  }
}

// Get demo booking history (admin only)
export const getDemoBookingHistoryHandler = async (req: Request, res: Response) => {
  try {
    const bookings = await demoService.getDemoBookingHistory()
    res.status(200).json(bookings)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve demo booking history' })
  }
}

// Update demo booking notes (admin only)
export const updateDemoBookingNotesHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const { userQuery, converted, additionalNotes } = req.body

    const booking = await demoService.updateDemoBookingNotes(bookingId, {
      userQuery,
      converted,
      additionalNotes,
    })

    res.status(200).json(booking)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update demo booking notes' })
  }
}

// Get admin demo slots (admin only)
export const getAdminDemoSlotsHandler = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query
    const slots = await demoService.getAdminDemoSlots(
      month ? parseInt(month as string) : undefined,
      year ? parseInt(year as string) : undefined
    )
    res.status(200).json(slots)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to retrieve demo slots' })
  }
}

// Create admin demo slots (admin only)
export const createAdminDemoSlotsHandler = async (req: Request, res: Response) => {
  try {
    const { month, year, slotTimes } = req.body // slotTimes: string[] e.g., ["09:00", "14:00", ...] (8 slots)

    if (!slotTimes || slotTimes.length !== 8) {
      return res.status(400).json({ message: 'Exactly 8 slot times are required' })
    }

    const slots = await demoService.createAdminDemoSlots(month, year, slotTimes)
    res.status(201).json(slots)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create demo slots' })
  }
}

// Update admin demo slots (admin only)
export const updateAdminDemoSlotsHandler = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.params
    const { slotTimes } = req.body

    if (!slotTimes || slotTimes.length !== 8) {
      return res.status(400).json({ message: 'Exactly 8 slot times are required' })
    }

    const slots = await demoService.updateAdminDemoSlots(
      parseInt(month),
      parseInt(year),
      slotTimes
    )
    res.status(200).json(slots)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update demo slots' })
  }
}

