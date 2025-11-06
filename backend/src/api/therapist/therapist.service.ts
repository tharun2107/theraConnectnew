import { BookingStatus } from '@prisma/client';
import { z } from 'zod';
import { sendNotification, sendNotificationBookingCancelled } from '../../services/notification.service';
import type { requestLeaveSchema, createTimeSlotsSchema } from './therapist.validation';
import { startOfDay, addMinutes, addDays, parse } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

type RequestLeaveInput = z.infer<typeof requestLeaveSchema>['body'];
type CreateTimeSlotsInput = z.infer<typeof createTimeSlotsSchema>['body'];
type GetSlotsInput = { date: string };
import { PrismaClient, Role, User, TherapistProfile, TimeSlot } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Activation step: mark up to 10 slots active
    if (Array.isArray(activateSlotIds) && activateSlotIds.length > 0) {
        if (activateSlotIds.length > 10) {
            throw new Error('You can activate at most 10 slots for a day.');
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
  const therapist = await prisma.therapistProfile.findUnique({ where: { id: therapistId } });
  if (!therapist) throw new Error('Therapist not found.');

  if (therapist.leavesRemainingThisMonth <= 0 && input.type == 'OPTIONAL') throw new Error('No leaves remaining.');

  const leaveDate = new Date(input.date);
  const startOfDay = new Date(leaveDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(leaveDate.setUTCHours(23, 59, 59, 999));

  const affectedBookings = await prisma.booking.findMany({
    where: {
      therapistId,
      status: 'SCHEDULED',
      timeSlot: { startTime: { gte: startOfDay, lte: endOfDay } },
    },
    include: { parent: { include: { user: true } }, timeSlot: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.therapistLeave.create({ data: { therapistId, date: startOfDay, type: input.type, reason: input.reason } });
    await tx.therapistProfile.update({ where: { id: therapistId }, data: { leavesRemainingThisMonth: { decrement: 1 } } });
    for (const booking of affectedBookings) {
      await tx.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.CANCELLED_BY_THERAPIST } });
      await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
    }
  });

  for (const booking of affectedBookings) {
    await sendNotificationBookingCancelled({
      userId: booking.parent.userId,
      message: `Your session for ${booking.timeSlot.startTime.toLocaleDateString()} has been cancelled as the therapist is unavailable.`,
      sendAt: new Date()
    });
  }
  return { message: 'Leave approved and affected bookings have been cancelled.' };
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




const SLOT_GENERATION_DAYS_AHEAD = 60;
const SLOT_DURATION_MINUTES = 60;
const REQUIRED_SLOTS_COUNT = 8;

export interface TimeSlotOption {
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string;   // HH:mm format (e.g., "10:00")
  label: string;     // Display label (e.g., "09:00 AM - 10:00 AM")
}

export interface ScheduleInput {
  selectedSlots: string[]; // Array of start times in HH:mm format (e.g., ["09:00", "10:00", "11:00"])
}

export class TherapistScheduleService {
  
  /**
   * Generate all possible time slot options for a 24-hour day
   * Returns slots from 00:00 to 23:00 in 1-hour intervals
   */
  generateAllTimeSlotOptions(): TimeSlotOption[] {
    const slots: TimeSlotOption[] = [];
    const baseDate = new Date(2024, 0, 1); // Dummy date for time parsing

    for (let hour = 0; hour < 24; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endHour = (hour + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      
      // Format for display
      const startDate = parse(startTime, 'HH:mm', baseDate);
      const endDate = parse(endTime, 'HH:mm', baseDate);
      
      const startLabel = this.formatTime(startDate);
      const endLabel = this.formatTime(endDate);
      
      slots.push({
        startTime,
        endTime,
        label: `${startLabel} - ${endLabel}`
      });
    }

    return slots;
  }

  /**
   * Format time to 12-hour format with AM/PM
   */
  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Get therapist profile with current schedule
   */
  async getTherapistProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        timezone: true,
        therapistProfile: {
          select: {
            id: true,
            selectedSlots: true,
            slotDurationInMinutes: true,
          }
        }
      }
    });

    if (!user || !user.therapistProfile) {
      throw new Error('Therapist profile not found');
    }

    return user;
  }

  /**
   * Validate selected slots
   */
  validateSelectedSlots(selectedSlots: string[]): void {
    // Check if exactly 8 slots are selected
    if (selectedSlots.length !== REQUIRED_SLOTS_COUNT) {
      throw new Error(`You must select exactly ${REQUIRED_SLOTS_COUNT} time slots`);
    }

    // Check for duplicates
    const uniqueSlots = new Set(selectedSlots);
    if (uniqueSlots.size !== selectedSlots.length) {
      throw new Error('Duplicate time slots are not allowed');
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const slot of selectedSlots) {
      if (!timeRegex.test(slot)) {
        throw new Error(`Invalid time format: ${slot}. Use HH:mm format`);
      }

      // Validate hour is within 0-23
      const hour = parseInt(slot.split(':')[0]);
      if (hour < 0 || hour > 23) {
        throw new Error(`Invalid hour: ${hour}. Must be between 0-23`);
      }
    }

    // Sort slots to ensure they're in chronological order
    const sortedSlots = [...selectedSlots].sort();
    selectedSlots.length = 0;
    selectedSlots.push(...sortedSlots);
  }

  /**
   * Set permanent schedule for therapist
   */
  async setPermanentSchedule(userId: string, data: ScheduleInput): Promise<TherapistProfile> {
    // Validate input
    this.validateSelectedSlots(data.selectedSlots);

    // Get user profile
    const user = await this.getTherapistProfile(userId);
    const therapistId = user.therapistProfile!.id;

    // Update therapist profile with selected slots
    const updatedProfile = await prisma.therapistProfile.update({
      where: { id: therapistId },
      data: {
        selectedSlots: data.selectedSlots,
        slotDurationInMinutes: SLOT_DURATION_MINUTES,
        maxSlotsPerDay: REQUIRED_SLOTS_COUNT,
      },
    });

    // Delete existing unbooked future slots
    await prisma.timeSlot.deleteMany({
      where: {
        therapistId: therapistId,
        startTime: {
          gte: new Date(), // From now onwards
        },
        isBooked: false,
      }
    });

    // Generate new time slots based on selected schedule
    await this.generateFutureSlots(userId);

    return updatedProfile;
  }

  /**
   * Generate TimeSlot records in UTC for the next 60 days
   */
  async generateFutureSlots(userId: string): Promise<TimeSlot[]> {
    const user = await this.getTherapistProfile(userId);
    const { therapistProfile, timezone } = user;
    
    if (!therapistProfile?.selectedSlots || therapistProfile.selectedSlots.length === 0) {
      throw new Error('No schedule configured. Please set your permanent schedule first');
    }

    const therapistId = therapistProfile.id;
    const selectedSlots = therapistProfile.selectedSlots as string[];
    
    const slotsToCreate: Array<{
      therapistId: string;
      startTime: Date;
      endTime: Date;
      isBooked: boolean;
      isActive: boolean;
    }> = [];

    // Get today's date at midnight in the therapist's timezone
    const todayLocal = startOfDay(new Date());

    // Generate slots for next 60 days
    for (let dayOffset = 0; dayOffset < SLOT_GENERATION_DAYS_AHEAD; dayOffset++) {
      const currentDay = addDays(todayLocal, dayOffset);

      // For each selected slot time
      for (const slotTime of selectedSlots) {
        // Parse the slot time (e.g., "09:00") and apply to current day
        const [hours, minutes] = slotTime.split(':').map(Number);
        
        // Create local time for this slot
        const localStartTime = new Date(currentDay);
        localStartTime.setHours(hours, minutes, 0, 0);
        
        // Create local end time (1 hour later)
        const localEndTime = addMinutes(localStartTime, SLOT_DURATION_MINUTES);

        // Convert local times to UTC
        const utcStartTime = fromZonedTime(localStartTime, timezone);
        const utcEndTime = fromZonedTime(localEndTime, timezone);

        slotsToCreate.push({
          therapistId,
          startTime: utcStartTime,
          endTime: utcEndTime,
          isBooked: false,
          isActive: true,
        });
      }
    }

    // Batch create all slots
    const createdSlots = await prisma.$transaction(
      slotsToCreate.map(slot => 
        prisma.timeSlot.create({ data: slot })
      )
    );

    return createdSlots;
  }

  /**
   * Get current schedule configuration
   */
  async getCurrentSchedule(userId: string) {
    const user = await this.getTherapistProfile(userId);
    
    return {
      userId: user.id,
      timezone: user.timezone,
      selectedSlots: user.therapistProfile?.selectedSlots || [],
      slotDurationInMinutes: user.therapistProfile?.slotDurationInMinutes || SLOT_DURATION_MINUTES
    };
  }
}

export const therapistScheduleService = new TherapistScheduleService();