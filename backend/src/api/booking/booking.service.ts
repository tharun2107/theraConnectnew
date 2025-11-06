import { PaymentStatus, Role, TherapistStatus } from '@prisma/client';
import { z } from 'zod';
import { sendNotification, sendNotificationAfterAnEventSessionCompleted, sendNotificationBookingConfirmed } from '../../services/notification.service';
import type { createBookingSchema } from './booking.validation';
import { PrismaClient, RecurringBooking, Booking, BookingStatus, RecurrencePattern } from '@prisma/client';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { format, startOfDay, endOfDay, addDays, parseISO, isBefore, isAfter, startOfMonth, endOfMonth, differenceInDays, getDay } from 'date-fns';
import { countWorkingDays } from '../../services/countWorkingDays';

const prisma = new PrismaClient();

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


export interface RecurringBookingInput {
  therapistId: string;
  childId: string;
  slotTime: string; 
  startDate: string; 
}

export interface RecurringBookingDetails extends RecurringBooking {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  nextSessionDate?: Date;
  displaySlotTime: string;
  displayDateRange: string;
  therapist: { name: string, specialization: string, baseCostPerSession: number };
  child: { name: string, age: number };
}

export class RecurringBookingService {

  /**
   * Create a recurring booking for all working days (Mon-Fri) for one month.
   */
  async createRecurringBooking(
    parentUserId: string,
    bookingData: RecurringBookingInput
  ): Promise<RecurringBooking> {
    
    // 1. Get Parent and Therapist Timezones
    const parent = await prisma.user.findUnique({
      where: { id: parentUserId },
      select: {
        timezone: true,
        parentProfile: {
          select: {
            id: true,
            children: {
              where: { id: bookingData.childId },
              select: { id: true }
            }
          }
        }
      }
    });

    if (!parent || !parent.parentProfile) throw new Error('Parent profile not found');
    if (parent.parentProfile.children.length === 0) throw new Error('Child not found or does not belong to this parent');
    
    const parentId = parent.parentProfile.id;

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: bookingData.therapistId },
      include: {
        user: { select: { timezone: true } }
      }
    });

    if (!therapist || !therapist.user) throw new Error('Therapist not found');
    if (therapist.status !== 'ACTIVE') throw new Error('Therapist is not available for bookings');

    const therapistTimezone = therapist.user.timezone;

    // 2. Calculate Date Range and Required Working Days
    const { startDate, endDate, workingDays } = countWorkingDays(bookingData.startDate);
    
    if (isBefore(startDate, startOfDay(new Date()))) {
      throw new Error('Start date cannot be in the past');
    }
    
    if (workingDays === 0) {
        throw new Error('No working days found in the selected month.');
    }

    // 3. Find all *required* UTC slots
    const requiredUtcSlots = this.getRequiredUtcSlots(
      startDate, 
      endDate, 
      bookingData.slotTime, 
      therapistTimezone
    );
    
    if (requiredUtcSlots.length !== workingDays) {
        // This is a sanity check, they should match
        throw new Error('Working day count and slot calculation mismatch.');
    }

    // 4. Check availability of all required slots in one query
    const availableSlots = await prisma.timeSlot.findMany({
      where: {
        therapistId: bookingData.therapistId,
        isBooked: false,
        isActive: true,
        startTime: { in: requiredUtcSlots }
      },
      select: { id: true }
    });

    // 5. Validate availability
    if (availableSlots.length !== workingDays) {
      throw new Error(
        `Cannot create recurring booking. Only ${availableSlots.length} out of ${workingDays} required working days are available at ${bookingData.slotTime}.`
      );
    }

    // 6. Create recurring booking and all individual bookings in a transaction
    return prisma.$transaction(async (tx) => {
      // A. Create RecurringBooking master record
      const recurring = await tx.recurringBooking.create({
        data: {
          parentId: parentId,
          childId: bookingData.childId,
          therapistId: bookingData.therapistId,
          recurrencePattern: RecurrencePattern.DAILY, // We use DAILY, but logic filters for weekdays
          slotTime: bookingData.slotTime, // Store local time for reference
          startDate: startDate,
          endDate: endDate,
          isActive: true
        }
      });

      // B. Create individual Booking records
      for (const slot of availableSlots) {
        // Mark slot as booked
        await tx.timeSlot.update({
          where: { id: slot.id },
          data: { isBooked: true }
        });

        // Create booking
        const booking = await tx.booking.create({
          data: {
            parentId: parentId,
            childId: bookingData.childId,
            therapistId: bookingData.therapistId,
            timeSlotId: slot.id,
            recurringBookingId: recurring.id,
            status: BookingStatus.SCHEDULED
          }
        });

        // Create payment record
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            parentId: parentId,
            therapistId: bookingData.therapistId,
            amount: therapist.baseCostPerSession,
            status: PaymentStatus.PENDING
          }
        });
      }

      return recurring;
    });
  }

  /**
   * Helper to get all required UTC start times for working days in a date range.
   */
  private getRequiredUtcSlots(
    startDate: Date, 
    endDate: Date, 
    slotTime: string, // "HH:mm"
    therapistTimezone: string
  ): Date[] {
    
    const requiredSlots: Date[] = [];
    const [hours, minutes] = slotTime.split(':').map(Number);

    for (let d = new Date(startDate); isBefore(d, endDate); d.setDate(d.getDate() + 1)) {
      const dayOfWeek = getDay(d);
      
      // Check if it's a working day (Mon-Fri)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Create the local date and time for the therapist
        const localDateTime = new Date(d);
        localDateTime.setHours(hours, minutes, 0, 0);

        // Convert to UTC
        const utcStartTime: Date = fromZonedTime(localDateTime, therapistTimezone);
        requiredSlots.push(utcStartTime);
      }
    }
    return requiredSlots;
  }

  /**
   * Get all recurring bookings for a parent
   */
  async getParentRecurringBookings(
    parentUserId: string
  ): Promise<RecurringBookingDetails[]> {
    
    const parent = await prisma.user.findUnique({
      where: { id: parentUserId },
      select: {
        timezone: true,
        parentProfile: { select: { id: true } }
      }
    });

    if (!parent || !parent.parentProfile) {
      throw new Error('Parent profile not found');
    }

    const recurringBookings = await prisma.recurringBooking.findMany({
      where: {
        parentId: parent.parentProfile.id
      },
      include: {
        therapist: {
          select: {
            name: true,
            specialization: true,
            baseCostPerSession: true
          }
        },
        child: {
          select: {
            name: true,
            age: true
          }
        },
        bookings: {
          include: {
            timeSlot: true
          },
          orderBy: {
            timeSlot: {
              startTime: 'asc'
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate statistics
    return recurringBookings.map(recurring => {
      const now = new Date();
      const totalSessions = recurring.bookings.length;
      const completedSessions = recurring.bookings.filter(
        b => b.status === BookingStatus.COMPLETED
      ).length;
      
      const upcomingBookings = recurring.bookings.filter(
        b => isAfter(b.timeSlot.startTime, now) && b.status === BookingStatus.SCHEDULED
      );
      
      const upcomingSessions = upcomingBookings.length;
      const nextSessionDate = upcomingBookings[0]?.timeSlot.startTime;

      return {
        ...recurring,
        totalSessions,
        completedSessions,
        upcomingSessions,
        nextSessionDate,
        displaySlotTime: this.formatTimeDisplay(recurring.slotTime),
        displayDateRange: `${format(recurring.startDate, 'MMM dd')} - ${format(recurring.endDate, 'MMM dd, yyyy')}`
      } as RecurringBookingDetails;
    });
  }

  /**
   * Cancel a recurring booking
   */
  async cancelRecurringBooking(
    parentUserId: string,
    recurringBookingId: string
  ): Promise<RecurringBooking> {
    
    const parent = await prisma.user.findUnique({
      where: { id: parentUserId },
      select: {
        parentProfile: { select: { id: true } }
      }
    });

    if (!parent || !parent.parentProfile) {
      throw new Error('Parent profile not found');
    }
    const parentId = parent.parentProfile.id;

    const recurringBooking = await prisma.recurringBooking.findUnique({
      where: { id: recurringBookingId },
      include: {
        bookings: {
          include: {
            timeSlot: true
          }
        }
      }
    });

    if (!recurringBooking) throw new Error('Recurring booking not found');
    if (recurringBooking.parentId !== parentId) throw new Error('This recurring booking does not belong to you');
    if (!recurringBooking.isActive) throw new Error('This recurring booking is already cancelled');

    return prisma.$transaction(async (tx) => {
      const now = new Date();

      const futureBookings = recurringBooking.bookings.filter(
        b => isAfter(b.timeSlot.startTime, now) && b.status === BookingStatus.SCHEDULED
      );

      for (const booking of futureBookings) {
        await tx.timeSlot.update({
          where: { id: booking.timeSlotId },
          data: { isBooked: false }
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED_BY_PARENT }
        });
      }

      return tx.recurringBooking.update({
        where: { id: recurringBookingId },
        data: { isActive: false }
      });
    });
  }

  /**
   * Get upcoming sessions for a recurring booking
   */
  async getUpcomingSessionsForRecurring(
    parentUserId: string,
    recurringBookingId: string
  ): Promise<any[]> { // Return type 'any' to include display fields
    
    const parent = await prisma.user.findUnique({
      where: { id: parentUserId },
      select: {
        timezone: true,
        parentProfile: { select: { id: true } }
      }
    });

    if (!parent || !parent.parentProfile) {
      throw new Error('Parent profile not found');
    }
    const parentTimezone = parent.timezone;
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        recurringBookingId: recurringBookingId,
        parentId: parent.parentProfile.id,
        status: BookingStatus.SCHEDULED,
        timeSlot: {
          startTime: { gte: now }
        }
      },
      include: {
        timeSlot: true,
        therapist: { select: { name: true, specialization: true } },
        child: { select: { name: true } }
      },
      orderBy: {
        timeSlot: { startTime: 'asc' }
      },
      take: 10
    });

    // Add display times in parent's timezone
    return bookings.map(booking => {
      const localStartTime = toZonedTime(booking.timeSlot.startTime, parentTimezone);
      const localEndTime = toZonedTime(booking.timeSlot.endTime, parentTimezone);

      return {
        ...booking,
        displayDate: format(localStartTime, 'EEEE, MMMM dd, yyyy'),
        displayTime: `${format(localStartTime, 'hh:mm a')} - ${format(localEndTime, 'hh:mm a')}`,
        displayStartTime: format(localStartTime, 'yyyy-MM-dd HH:mm')
      };
    });
  }

  /** Helper: Format time for display */
  private formatTimeDisplay(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, 'hh:mm a');
  }
}

export const recurringBookingService = new RecurringBookingService();