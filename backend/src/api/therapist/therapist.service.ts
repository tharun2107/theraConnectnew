import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import { sendNotification, sendNotificationBookingCancelled } from '../../services/notification.service';
import type { requestLeaveSchema, createTimeSlotsSchema } from './therapist.validation';
import prisma from '../../utils/prisma';
type RequestLeaveInput = z.infer<typeof requestLeaveSchema>['body'];
type CreateTimeSlotsInput = z.infer<typeof createTimeSlotsSchema>['body'];
type GetSlotsInput = { date: string };

export const getTherapistProfile = async (userId: string) => {
    return prisma.therapistProfile.findUnique({ where: { userId } });
};

export const createTimeSlots = async (therapistId: string, input: CreateTimeSlotsInput) => {
    const { date, slots, generate, activateSlotIds } = input as any;
    console.log('[service.createTimeSlots] input=', { date, hasSlots: Array.isArray(slots) && slots.length, generate, activateCount: Array.isArray(activateSlotIds) ? activateSlotIds.length : 0 });

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    // Legacy path: directly create provided slots (kept for backward compatibility)
    if (Array.isArray(slots) && slots.length > 0) {
        const slotsData = slots.map((slot: any) => ({
            therapistId,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            isActive: true, // explicitly created are considered active
        }));
        return prisma.timeSlot.createMany({ data: slotsData });
    }

    // New flow: generate 24 slots (45m session + 15m gap) from the therapist's scheduleStartTime
    if (generate) {
        // Generate 24 hourly slots across the day: HH:00 -> HH:45 for HH=00..23 (UTC)
        const slotDurationMinutes = 45;
        const toCreate: any[] = [];
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        for (let hour = 0; hour < 24; hour++) {
            const startTime = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
            const endTime = new Date(startTime.getTime() + slotDurationMinutes * 60000);
            toCreate.push({ therapistId, startTime, endTime, isActive: false });
        }

        // Remove any unbooked slots for that day before regenerating, to avoid duplicates
        await prisma.timeSlot.deleteMany({
            where: {
                therapistId,
                isBooked: false,
                startTime: { gte: dayStart, lte: dayEnd },
            },
        });
        await prisma.timeSlot.createMany({ data: toCreate });
        console.log('[service.createTimeSlots] generated=', toCreate.length);
    }

    // Activation step: mark up to therapist.maxSlotsPerDay (default 8) slots active
    if (Array.isArray(activateSlotIds) && activateSlotIds.length > 0) {
        const therapist = await prisma.therapistProfile.findUnique({ where: { id: therapistId } });
        const maxSlotsPerDay = therapist?.maxSlotsPerDay ?? 8;
        if (activateSlotIds.length > maxSlotsPerDay) {
            throw new Error(`You can activate at most ${maxSlotsPerDay} slots for a day.`);
        }
        // Verify all belong to therapist and date
        const slotsToActivate = await prisma.timeSlot.findMany({
            where: {
                id: { in: activateSlotIds },
                therapistId,
                isBooked: false,
                startTime: { gte: dayStart, lte: dayEnd },
            },
        });
        if (slotsToActivate.length !== activateSlotIds.length) {
            throw new Error('Some slots are invalid, booked, or outside selected date.');
        }
        const updateRes = await prisma.timeSlot.updateMany({
            where: { id: { in: activateSlotIds } },
            data: { isActive: true },
        });
        console.log('[service.createTimeSlots] activated count=', updateRes.count);
        // Deactivate any other unbooked slots that day
        const deactivateRes = await prisma.timeSlot.updateMany({
            where: {
                therapistId,
                isBooked: false,
                startTime: { gte: dayStart, lte: dayEnd },
                id: { notIn: activateSlotIds },
            },
            data: { isActive: false },
        });
        console.log('[service.createTimeSlots] deactivated count=', deactivateRes.count);
    }

    // Return current day's slots
    const list = await prisma.timeSlot.findMany({
        where: { therapistId, startTime: { gte: dayStart, lte: dayEnd } },
        orderBy: { startTime: 'asc' },
    });
    console.log('[service.createTimeSlots] returning slots=', list.length);
    return list;
};

export const requestLeave = async (therapistId: string, input: RequestLeaveInput) => {
  const therapist = await prisma.therapistProfile.findUnique({ where: { id: therapistId }, include: { user: true } });
  if (!therapist) throw new Error('Therapist not found.');
  if (therapist.leavesRemainingThisMonth <= 0) throw new Error('No leaves remaining.');

  const leaveDate = new Date(input.date);
  const startOfDay = new Date(leaveDate.setUTCHours(0, 0, 0, 0));

  // Create a pending leave request; admin will approve/reject later
  await prisma.$transaction(async (tx) => {
    await tx.therapistLeave.create({ data: { therapistId, date: startOfDay, type: input.type, reason: input.reason, isApproved: false } });
  });

  // Notify all admins via notification/email
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  await Promise.all(admins.map((admin) => sendNotification({
    userId: admin.id,
    message: `Leave request pending approval: ${therapist.name} on ${startOfDay.toDateString()} (${input.type}).`,
    sendAt: new Date()
  })));

  // Acknowledge therapist
  await sendNotification({
    userId: therapist.userId,
    message: `Your leave request for ${startOfDay.toDateString()} has been submitted for admin approval.`,
    sendAt: new Date()
  });

  return { message: 'Leave request submitted for approval.' };
};

export const getMySlotsForDate = async (therapistId: string, input: GetSlotsInput) => {
  const { date } = input;
  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);
  console.log('[service.getMySlotsForDate] computed range', { dayStart: dayStart.toISOString(), dayEnd: dayEnd.toISOString() });
  return prisma.timeSlot.findMany({
    where: {
      therapistId,
      startTime: { gte: dayStart, lte: dayEnd },
      // Return all slots for the date, including inactive/unbooked so therapist can activate them
    },
    orderBy: { startTime: 'asc' },
  });
};