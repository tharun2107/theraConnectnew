import type { Request, Response } from 'express'
import prisma from '../../utils/prisma'
import { Role } from '@prisma/client'
import { createRealMeeting, generateMeetingSdkSignature, getSdkKey } from '../../services/zoom.service'

export const createMeetingForBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    // Ensure the booking belongs to the therapist
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, therapist: { userId: req.user!.userId } },
      include: { timeSlot: true },
    })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    // If meeting already exists, return it
    if (booking.meetingId) {
      return res.status(200).json({ meetingId: booking.meetingId, password: booking.meetingPassword })
    }

    const startTimeIso = booking.timeSlot.startTime.toISOString()
    const duration = Math.max(15, Math.round((booking.timeSlot.endTime.getTime() - booking.timeSlot.startTime.getTime()) / 60000))
    const topic = `Therabee Session - ${booking.id}`
    const meeting = await createRealMeeting({ topic, startTimeIso, durationMinutes: duration })

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { meetingId: meeting.meetingId, meetingPassword: meeting.password, zoomLink: meeting.joinUrl },
    })
    res.status(201).json({ meetingId: updated.meetingId, password: updated.meetingPassword })
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Failed to create meeting' })
  }
}

export const markHostStarted = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, therapist: { userId: req.user!.userId } } })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    await prisma.booking.update({ where: { id: bookingId }, data: { hostStarted: true } })
    res.status(200).json({ message: 'Host started set' })
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Failed to update host started' })
  }
}

export const getSignature = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || !booking.meetingId) return res.status(404).json({ message: 'Meeting not ready' })

    // Parents can only join if host started
    if (req.user!.role === Role.PARENT && !booking.hostStarted) {
      return res.status(403).json({ message: 'Host has not started the meeting yet' })
    }

    const role: 0 | 1 = req.user!.role === Role.THERAPIST ? 1 : 0
    const signature = generateMeetingSdkSignature(booking.meetingId, role)
    const sdkKey = getSdkKey()
    res.status(200).json({ signature, sdkKey, meetingNumber: booking.meetingId, password: booking.meetingPassword })
  } catch (e: any) {
    res.status(400).json({ message: e.message || 'Failed to generate signature' })
  }
}


