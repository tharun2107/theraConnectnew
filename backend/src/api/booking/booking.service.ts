import { Role, TherapistStatus } from '@prisma/client';
import { z } from 'zod';
import { sendNotification } from '../../services/notification.service';
import type { createBookingSchema } from './booking.validation';
import prisma from '../../utils/prisma';
type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];

export const getAvailableSlots = async (therapistId: string, date: string) => {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    console.log('[booking.service.getAvailableSlots] window', { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString(), therapistId });
    const slots = await prisma.timeSlot.findMany({
        where: {
            therapistId,
            isBooked: false,
            isActive: true,
            startTime: { gte: startOfDay, lte: endOfDay },
            therapist: { status: TherapistStatus.ACTIVE },
        },
        // where: {
        //     therapistId,
        //     isBooked: false,
        //     ...( { isActive: true } as any ),
        //     startTime: { gte: startOfDay, lte: endOfDay },
        //     therapist: { status: TherapistStatus.ACTIVE },
        //   },
        orderBy: { startTime: 'asc' },
    });
    console.log('[booking.service.getAvailableSlots] found', slots.length);
    return slots;
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

    await sendNotification({
        userId: timeSlot.therapist.userId,
        type: 'BOOKING_CONFIRMED',
        message: `You have a new booking with ${child.name} on ${timeSlot.startTime.toLocaleString()}.`
    });
    await sendNotification({
        userId: parent!.userId,
        type: 'BOOKING_CONFIRMED',
        message: `Your booking for ${child.name} is confirmed for ${timeSlot.startTime.toLocaleString()}.`
    });

    return booking;
};

export const getMyBookings = async (userId: string, role: Role) => {
    const whereClause =
        role === Role.PARENT
            ? { parent: { userId } }
            : { therapist: { userId, status: TherapistStatus.ACTIVE } };

    // Hide child information from therapists
    const includeForParent = {
        child: true,
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
    } as const;

    const includeForTherapist = {
        // child intentionally omitted
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
    } as const;

    return prisma.booking.findMany({
        where: whereClause,
        include: role === Role.PARENT ? (includeForParent as any) : (includeForTherapist as any),
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
};