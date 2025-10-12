import type { Request, Response } from 'express';
import * as bookingService from './booking.service';
import prisma from '../../utils/prisma';

export const markSessionCompletedHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params
    const updatedBooking = await bookingService.markSessionCompleted(bookingId)
    res.status(200).json({ 
      message: 'Session marked as completed', 
      booking: updatedBooking 
    })
  } catch (error: any) {
    console.error('[booking.markSessionCompleted][ERROR]', error)
    res.status(400).json({ message: error.message || 'Failed to mark session as completed' })
  }
}

export const getAvailableSlotsHandler = async (req: Request, res: Response) => {
    try {
        const validated = (res.locals as any)?.validated?.query as { therapistId: string; date: string } | undefined;
        const { therapistId, date } = validated ?? (req.query as any);
        console.log('[booking.getAvailableSlots] params=', { therapistId, date });
        const slots = await bookingService.getAvailableSlots(therapistId, date);
        console.log('[booking.getAvailableSlots] results=', slots.length);
        res.status(200).json(slots);
    } catch (error: any) {
        console.error('[booking.getAvailableSlots][ERROR]', error);
        res.status(400).json({ message: error.message || 'Failed to get slots' });
    }
};

export const createBookingHandler = async (req: Request, res: Response) => {
    try {
        console.log('[booking.create] body=', req.body);
        const parentProfile = await prisma.parentProfile.findUnique({ where: { userId: req.user!.userId }});
        if (!parentProfile) return res.status(404).json({ message: 'Parent profile not found' });

        const booking = await bookingService.createBooking(parentProfile.id, req.body);
        res.status(201).json(booking);
    } catch (error: any) {
        console.error('[booking.create][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
};

export const getMyBookingsHandler = async (req: Request, res: Response) => {
    try {
        const bookings = await bookingService.getMyBookings(req.user!.userId, req.user!.role);
        res.status(200).json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to retrieve bookings' });
    }
}