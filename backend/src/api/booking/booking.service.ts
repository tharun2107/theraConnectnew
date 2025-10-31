import { Role, TherapistStatus } from '@prisma/client';
import { z } from 'zod';
import { sendNotification, sendNotificationAfterAnEventSessionCompleted, sendNotificationBookingConfirmed } from '../../services/notification.service';
import type { createBookingSchema } from './booking.validation';
import prisma from '../../utils/prisma';
type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];

export const markSessionCompleted = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      therapist: { include: { user: true } },
      child: true,
    },
  })

  if (!booking) {
    throw new Error('Booking not found')
  }

  if (booking.status !== 'SCHEDULED') {
    throw new Error('Session can only be completed if it was scheduled')
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      isCompleted: true,
    } as any,
    include: {
      parent: { include: { user: true } },
      therapist: { include: { user: true } },
      child: true,
    },
  })

  // Send notifications
  await sendNotificationAfterAnEventSessionCompleted({
    userId: booking.parent.userId,
    message: `Session with ${booking.therapist.name} for ${booking.child.name} has been completed. Please provide your feedback.`,
    sendAt: new Date()
  })

  await sendNotificationAfterAnEventSessionCompleted({
    userId: booking.therapist.userId,
    message: `Session with ${booking.child.name} has been completed. Please create a session report.`,
    sendAt: new Date()
  })

  return updatedBooking
}

export const getAvailableSlots = async (therapistId: string, date: string) => {
    const therapist = await prisma.therapistProfile.findUnique({
        where: { id: therapistId, status: TherapistStatus.ACTIVE },
        select: { availableSlotTimes: true, slotDurationInMinutes: true },
    });
    
    if (!therapist) {
        throw new Error('Therapist not found or not active');
    }
    
    if (!therapist.availableSlotTimes || therapist.availableSlotTimes.length === 0) {
        return [];
    }
    
    // Validate and normalize date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        throw new Error(`Invalid date format: ${date}. Expected format: YYYY-MM-DD`);
    }
    
    // Validate that the date is valid
    const testDate = new Date(`${date}T00:00:00.000Z`);
    if (isNaN(testDate.getTime())) {
        throw new Error(`Invalid date: ${date}`);
    }
    
    // Ensure year is reasonable (2000-2099)
    const year = parseInt(date.substring(0, 4), 10);
    if (year < 2000 || year > 2099) {
        throw new Error(`Invalid year: ${year}. Year must be between 2000 and 2099`);
    }
    
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    
    // Check if therapist has leave on this date
    const hasLeave = await prisma.therapistLeave.findFirst({
        where: { therapistId, date: startOfDay },
    });
    if (hasLeave) {
        return [];
    }
    
    const slotDurationInMinutes = 60; // Fixed to 1 hour per session
    
    // Delete any existing slots for this date that don't match availableSlotTimes
    // This ensures we don't have old slots from previous systems
    await prisma.timeSlot.deleteMany({
        where: {
            therapistId,
            startTime: { gte: startOfDay, lte: endOfDay },
            isBooked: false, // Only delete unbooked slots
        },
    });
    
    // Generate slots for the requested date from availableSlotTimes
    // Treat availableSlotTimes as literal hours/minutes to display (not tied to server timezone)
    // Store as UTC to ensure consistent display across all clients
    const slotsToCreate = [];
    for (const timeStr of therapist.availableSlotTimes) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        // Parse the date string to get year, month, day
        const dateParts = date.split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(dateParts[2], 10);
        
        // Create date in UTC with the exact hours/minutes from availableSlotTimes
        // This ensures the stored time represents the literal time (e.g., 12:00 means 12:00)
        const slotStart = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
        const slotEnd = new Date(slotStart.getTime() + slotDurationInMinutes * 60000);
        
        slotsToCreate.push({
            therapistId,
            startTime: slotStart,
            endTime: slotEnd,
            isActive: true,
            isBooked: false,
        });
    }
    
    if (slotsToCreate.length > 0) {
        await prisma.timeSlot.createMany({ data: slotsToCreate });
    }
    
    // Return available slots for the date (only those matching availableSlotTimes)
    const slots = await prisma.timeSlot.findMany({
        where: {
            therapistId,
            isBooked: false,
            isActive: true,
            startTime: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startTime: 'asc' },
    });
    
    // Filter to ensure only slots from availableSlotTimes are returned
    // Compare using UTC hours/minutes since slots are stored in UTC
    const validSlotTimes = new Set(therapist.availableSlotTimes);
    const filteredSlots = slots.filter((slot: any) => {
        const slotDate = new Date(slot.startTime);
        const slotHours = slotDate.getUTCHours();
        const slotMinutes = slotDate.getUTCMinutes();
        const slotTimeStr = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        return validSlotTimes.has(slotTimeStr);
    });
    
    console.log('[booking.service.getAvailableSlots] therapist availableSlotTimes:', therapist.availableSlotTimes);
    console.log('[booking.service.getAvailableSlots] created', slotsToCreate.length, 'new slots');
    console.log('[booking.service.getAvailableSlots] found', filteredSlots.length, 'valid slots out of', slots.length, 'total');
    filteredSlots.forEach((slot: any) => {
        const slotDate = new Date(slot.startTime);
        const slotHours = slotDate.getUTCHours();
        const slotMinutes = slotDate.getUTCMinutes();
        const slotTimeStr = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        console.log('[booking.service.getAvailableSlots] slot:', slotTimeStr, 'startTime:', slot.startTime.toISOString(), 'local:', slotDate.toLocaleString());
    });
    return filteredSlots;
};

export const createBooking = async (parentId: string, input: CreateBookingInput) => {
    const { childId, timeSlotId } = input;

    const timeSlot = await prisma.timeSlot.findFirst({
        where: { id: timeSlotId, isBooked: false },
        include: { therapist: true },
    });
    if (!timeSlot) throw new Error('This time slot is not available.');
    if (timeSlot.therapist.status !== TherapistStatus.ACTIVE) {
        throw new Error('This therapist is not available for booking.');
    }

    const child = await prisma.child.findFirst({
        where: { id: childId, parentId },
    });
    if (!child) throw new Error('Child not found or does not belong to this parent.');

    const parent = await prisma.parentProfile.findUnique({ where: { id: parentId } });

    const finalFee = parent?.customFee ?? timeSlot.therapist.baseCostPerSession;

    const booking = await prisma.$transaction(async (tx) => {
        await tx.timeSlot.update({ where: { id: timeSlotId }, data: { isBooked: true } });

        const newBooking = await tx.booking.create({
            data: {
                parentId,
                childId,
                therapistId: timeSlot.therapistId,
                timeSlotId,
            },
        });

        await tx.payment.create({
            data: {
                bookingId: newBooking.id,
                parentId,
                therapistId: timeSlot.therapistId,
                amount: finalFee,
            }
        });

        await tx.dataAccessPermission.create({
            data: {
                bookingId: newBooking.id,
                childId,
                therapistId: timeSlot.therapistId,
                canViewDetails: false, // Default to false
                accessStartTime: timeSlot.startTime,
                accessEndTime: timeSlot.endTime,
            }
        });

        return newBooking;
    });

    await sendNotificationBookingConfirmed({
        userId: timeSlot.therapist.userId,
        message: `You have a new booking with ${child.name} on ${timeSlot.startTime.toLocaleString()}.`,
        sendAt: new Date()
    });
    await sendNotificationBookingConfirmed({
        userId: parent!.userId,
        message: `Your booking for ${child.name} is confirmed for ${timeSlot.startTime.toLocaleString()}.`,
        sendAt: new Date()
    });

    return booking;
};

export const getMyBookings = async (userId: string, role: Role) => {
    const whereClause =
        role === Role.PARENT
            ? { parent: { userId } }
            : { therapist: { userId, status: TherapistStatus.ACTIVE } };

    // Include child information for parents
    const includeForParent = {
        child: true,
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
        SessionFeedback: true,
        sessionReport: true,
        ConsentRequest: true,
    } as const;

    // For therapists, include child data only if consent is given
    const includeForTherapist = {
        child: {
            select: {
                id: true,
                name: true,
                age: true,
                condition: true,
                notes: true,
                address: true,
            }
        },
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
        SessionFeedback: true,
        sessionReport: true,
        ConsentRequest: true,
    } as const;

    const bookings = await prisma.booking.findMany({
        where: whereClause,
        include: role === Role.PARENT ? (includeForParent as any) : (includeForTherapist as any),
        orderBy: { timeSlot: { startTime: 'desc' } },
    });

    // For therapists, filter out child details if consent is not given
    if (role === Role.THERAPIST) {
        return bookings.map((booking: any) => {
            const hasConsent = booking.ConsentRequest?.status === 'GRANTED';
            
            return {
                ...booking,
                child: hasConsent ? booking.child : {
                    id: booking.child?.id,
                    name: booking.child?.name,
                    age: undefined,
                    condition: undefined,
                    notes: undefined,
                    address: undefined,
                }
            };
        });
    }

    return bookings;
};