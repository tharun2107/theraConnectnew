import { Role, TherapistStatus, BookingStatus } from '@prisma/client';
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

  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // Send notifications
  // await sendNotificationAfterAnEventSessionCompleted({
  //   userId: booking.parent.userId,
  //   message: `Session with ${booking.therapist.name} for ${booking.child.name} has been completed. Please provide your feedback.`,
  //   sendAt: new Date()
  // })

  // await sendNotificationAfterAnEventSessionCompleted({
  //   userId: booking.therapist.userId,
  //   message: `Session with ${booking.child.name} has been completed. Please create a session report.`,
  //   sendAt: new Date()
  // })

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
    
    // Check if date is a weekend (Saturday or Sunday)
    const dayOfWeek = testDate.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw new Error('Bookings are not available on weekends (Saturday and Sunday)');
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
    
    // Return ALL slots for the date (both booked and available) to show booking status in UI
    // Include booking information to show which child/parent has booked
    const slots = await prisma.timeSlot.findMany({
        where: {
            therapistId,
            isActive: true,
            startTime: { gte: startOfDay, lte: endOfDay },
        },
        include: {
            booking: {
                include: {
                    child: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    parent: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
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
    console.log('[booking.service.getAvailableSlots] returning', filteredSlots.length, 'slots (available + booked)');
    filteredSlots.forEach((slot: any) => {
        const slotDate = new Date(slot.startTime);
        const slotHours = slotDate.getUTCHours();
        const slotMinutes = slotDate.getUTCMinutes();
        const slotTimeStr = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        console.log('[booking.service.getAvailableSlots] slot:', slotTimeStr, 'isBooked:', slot.isBooked, 'startTime:', slot.startTime.toISOString());
    });
    return filteredSlots;
};

export const createBooking = async (parentId: string, input: CreateBookingInput) => {
    const { childId, timeSlotId } = input;

    // Check slot availability with atomic check
    const timeSlot = await prisma.timeSlot.findFirst({
        where: { id: timeSlotId, isBooked: false },
        include: { therapist: true },
    });
    if (!timeSlot) throw new Error('This time slot is not available. It may have been booked by another parent.');
    if (timeSlot.therapist.status !== TherapistStatus.ACTIVE) {
        throw new Error('This therapist is not available for booking.');
    }

    // Check if the booking date is a weekend (Saturday or Sunday)
    const bookingDate = new Date(timeSlot.startTime);
    const dayOfWeek = bookingDate.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw new Error('Bookings are not available on weekends (Saturday and Sunday)');
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

    // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
    // await sendNotificationBookingConfirmed({
    //     userId: timeSlot.therapist.userId,
    //     message: `You have a new booking with ${child.name} on ${timeSlot.startTime.toLocaleString()}.`,
    //     sendAt: new Date()
    // });
    // await sendNotificationBookingConfirmed({
    //     userId: parent!.userId,
    //     message: `Your booking for ${child.name} is confirmed for ${timeSlot.startTime.toLocaleString()}.`,
    //     sendAt: new Date()
    // });

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

    // Debug logging for parent bookings
    if (role === Role.PARENT) {
        console.log('[booking.service.getMyBookings] Parent userId:', userId)
        console.log('[booking.service.getMyBookings] Total bookings found:', bookings.length)
        // Group bookings by child
        const bookingsByChild = bookings.reduce((acc: any, booking: any) => {
            const childId = booking.child?.id || 'unknown'
            const childName = booking.child?.name || 'Unknown'
            if (!acc[childId]) {
                acc[childId] = { childName, count: 0, bookings: [] }
            }
            acc[childId].count++
            acc[childId].bookings.push({
                id: booking.id,
                status: booking.status,
                startTime: booking.timeSlot?.startTime
            })
            return acc
        }, {})
        console.log('[booking.service.getMyBookings] Bookings grouped by child:', JSON.stringify(bookingsByChild, null, 2))
    }

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

/**
 * Get all bookings for a specific therapist (for parents to check availability)
 * This allows parents to see which slots are booked for a therapist
 */
export const getTherapistBookings = async (therapistId: string) => {
    // Get all bookings for the therapist with SCHEDULED status
    const bookings = await prisma.booking.findMany({
        where: {
            therapistId,
            status: 'SCHEDULED', // Only get scheduled bookings
        },
        include: {
            timeSlot: {
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    isBooked: true,
                }
            },
            child: {
                select: {
                    id: true,
                    name: true,
                }
            },
            parent: {
                select: {
                    id: true,
                    name: true,
                }
            },
        },
        orderBy: { timeSlot: { startTime: 'asc' } },
    });

    return bookings;
};

// ============================================
// RECURRING BOOKING SERVICE
// ============================================

import { RecurrencePattern, DayOfWeek } from '@prisma/client';
import { addDays, startOfDay, eachDayOfInterval, isWeekend } from 'date-fns';

export interface RecurringBookingInput {
  childId: string;
  therapistId: string;
  slotTime: string; // HH:mm format
  recurrencePattern: RecurrencePattern;
  dayOfWeek?: DayOfWeek; // Required if recurrencePattern is WEEKLY
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (typically end of month)
}

export class RecurringBookingService {
  /**
   * Create a recurring booking and generate individual bookings
   */
  async createRecurringBooking(userId: string, input: RecurringBookingInput) {
    // Get parent profile
    const parent = await prisma.parentProfile.findUnique({
      where: { userId },
      include: { user: true }
    });
    if (!parent) throw new Error('Parent profile not found');

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: { id: input.childId, parentId: parent.id }
    });
    if (!child) throw new Error('Child not found or does not belong to this parent');

    // Verify therapist exists and is active
    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: input.therapistId, status: TherapistStatus.ACTIVE },
      include: { user: true }
    });
    if (!therapist) throw new Error('Therapist not found or not active');

    // Validate slot time is in therapist's available slots
    if (!therapist.availableSlotTimes || !therapist.availableSlotTimes.includes(input.slotTime)) {
      throw new Error(`Selected time slot ${input.slotTime} is not available for this therapist. Please select from available slots.`);
    }

    // Validate dates
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const today = startOfDay(new Date());

    // Pre-check: Count how many slots in the date range are already booked
    // This helps prevent creating recurring bookings when most slots are unavailable
    const [hours, minutes] = input.slotTime.split(':').map(Number);
    const slotDurationMinutes = therapist.slotDurationInMinutes || 60;
    
    // Generate all dates in the range to check availability
    let datesToCheck: Date[] = [];
    if (input.recurrencePattern === RecurrencePattern.DAILY) {
      const allDays = eachDayOfInterval({ start: startDate, end: endDate });
      datesToCheck = allDays.filter(day => !isWeekend(day) && day >= today);
    } else if (input.recurrencePattern === RecurrencePattern.WEEKLY && input.dayOfWeek) {
      const dayOfWeekMap: { [key in DayOfWeek]: number } = {
        MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
      };
      const targetDay = dayOfWeekMap[input.dayOfWeek];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (currentDate.getDay() === targetDay && currentDate >= today) {
          datesToCheck.push(new Date(currentDate));
        }
        currentDate = addDays(currentDate, 1);
      }
    }

    // Check how many slots are already booked
    let bookedCount = 0;
    for (const date of datesToCheck) {
      // Check if therapist has leave
      const hasLeave = await prisma.therapistLeave.findFirst({
        where: {
          therapistId: input.therapistId,
          date: date,
          status: 'APPROVED'
        }
      });
      if (hasLeave) {
        bookedCount++;
        continue;
      }

      // Check if slot is already booked
      const slotStart = new Date(date);
      slotStart.setHours(hours, minutes, 0, 0);
      slotStart.setSeconds(0, 0);
      const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60000);

      const existingSlot = await prisma.timeSlot.findFirst({
        where: {
          therapistId: input.therapistId,
          startTime: slotStart,
          endTime: slotEnd,
          isBooked: true
        }
      });

      if (existingSlot) {
        bookedCount++;
      }
    }

    // For recurring bookings, ALL slots in the date range must be available
    // If any slot is already booked, reject the recurring booking
    if (bookedCount > 0) {
      const availableCount = datesToCheck.length - bookedCount;
      throw new Error(
        `Cannot create recurring booking: ${bookedCount} slot(s) in the selected date range are already booked. ` +
        `For monthly recurring bookings, all dates must be available. ` +
        `Only ${availableCount} out of ${datesToCheck.length} slots are available. Please select a different time slot or date range.`
      );
    }

    if (startDate < today) {
      throw new Error('Start date cannot be in the past');
    }
    if (endDate < startDate) {
      throw new Error('End date must be after start date');
    }

    // Validate recurrence pattern
    if (input.recurrencePattern === RecurrencePattern.WEEKLY && !input.dayOfWeek) {
      throw new Error('dayOfWeek is required for WEEKLY recurrence pattern');
    }

    // Check if child already has an active recurring booking with this therapist
    const existingRecurring = await prisma.recurringBooking.findFirst({
      where: {
        childId: input.childId,
        therapistId: input.therapistId,
        isActive: true
      }
    });

    if (existingRecurring) {
      throw new Error('Child already has an active recurring booking with this therapist');
    }

    // Create recurring booking
    const recurringBooking = await prisma.recurringBooking.create({
      data: {
        parentId: parent.id,
        childId: input.childId,
        therapistId: input.therapistId,
        slotTime: input.slotTime,
        recurrencePattern: input.recurrencePattern,
        dayOfWeek: input.dayOfWeek || null,
        startDate: startDate,
        endDate: endDate,
        isActive: true
      }
    });

    // Generate individual bookings for the date range
    await this.generateBookingsForRecurring(recurringBooking.id);

    return recurringBooking;
  }

  /**
   * Generate individual bookings from a recurring booking
   */
  private async generateBookingsForRecurring(recurringBookingId: string) {
    try {
      const recurring = await prisma.recurringBooking.findUnique({
        where: { id: recurringBookingId },
        include: {
          parent: true,
          child: true,
          therapist: { include: { user: true } }
        }
      });

      if (!recurring || !recurring.isActive) {
        throw new Error('Recurring booking not found or inactive');
      }

      if (!recurring.therapist) {
        throw new Error('Therapist not found for recurring booking');
      }

      if (!recurring.therapist.baseCostPerSession) {
        throw new Error('Therapist base cost per session is not set');
      }

      const startDate = new Date(recurring.startDate);
      const endDate = new Date(recurring.endDate);
      const today = startOfDay(new Date());

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid start or end date');
      }

      // Generate dates based on recurrence pattern
      const dates: Date[] = [];
      
      if (recurring.recurrencePattern === RecurrencePattern.DAILY) {
        // Generate all dates in range (excluding weekends)
        const allDays = eachDayOfInterval({ start: startDate, end: endDate });
        dates.push(...allDays.filter(day => !isWeekend(day) && day >= today));
      } else if (recurring.recurrencePattern === RecurrencePattern.WEEKLY && recurring.dayOfWeek) {
        // Generate dates for specific day of week
        const dayOfWeekMap: { [key in DayOfWeek]: number } = {
          MONDAY: 1,
          TUESDAY: 2,
          WEDNESDAY: 3,
          THURSDAY: 4,
          FRIDAY: 5,
          SATURDAY: 6
        };
        const targetDay = dayOfWeekMap[recurring.dayOfWeek];
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getDay() === targetDay && currentDate >= today) {
            dates.push(new Date(currentDate));
          }
          currentDate = addDays(currentDate, 1);
        }
      }

      // Validate slot time format
      if (!recurring.slotTime || !recurring.slotTime.includes(':')) {
        throw new Error(`Invalid slot time format: ${recurring.slotTime}. Expected format: HH:mm`);
      }

      // Parse slot time (HH:mm)
      const timeParts = recurring.slotTime.split(':');
      if (timeParts.length !== 2) {
        throw new Error(`Invalid slot time format: ${recurring.slotTime}. Expected format: HH:mm`);
      }

      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Invalid slot time values: ${recurring.slotTime}. Hours must be 0-23, minutes must be 0-59`);
      }

      const slotDurationMinutes = recurring.therapist.slotDurationInMinutes || 60;

      // Create bookings for each date in a transaction
      const finalFee = recurring.parent.customFee ?? recurring.therapist.baseCostPerSession;
      
      if (!finalFee || finalFee <= 0) {
        throw new Error('Invalid fee amount. Fee must be greater than 0');
      }

      const bookingsToCreate = [];

      for (const date of dates) {
        // Check if therapist has leave on this date
        const hasLeave = await prisma.therapistLeave.findFirst({
          where: {
            therapistId: recurring.therapistId,
            date: date,
            status: 'APPROVED'
          }
        });
        if (hasLeave) continue;

        try {
          // Create time slot
          const slotStart = new Date(date);
          slotStart.setHours(hours, minutes, 0, 0);
          slotStart.setSeconds(0, 0); // Ensure seconds and milliseconds are 0
          const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60000);

          // Validate slot times
          if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
            console.error(`[RecurringBooking] Invalid slot times for date ${date.toISOString()}`);
            continue;
          }

          // Check if slot already exists and is booked
          const existingSlot = await prisma.timeSlot.findFirst({
            where: {
              therapistId: recurring.therapistId,
              startTime: slotStart,
              endTime: slotEnd
            },
            include: {
              booking: {
                include: {
                  child: true,
                  parent: true
                }
              }
            }
          });

          if (existingSlot && existingSlot.isBooked) {
            // Log which parent/child has booked this slot
            const bookings = Array.isArray(existingSlot.booking) ? existingSlot.booking : (existingSlot.booking ? [existingSlot.booking] : []);
            if (bookings.length > 0) {
              const bookingInfo = bookings[0] as any;
              console.log(`[RecurringBooking] Slot ${slotStart.toISOString()} already booked by ${bookingInfo.parent?.name} for ${bookingInfo.child?.name}`);
            }
            continue; // Skip if already booked
          }

          // Create booking in transaction
          const result = await prisma.$transaction(async (tx) => {
            const timeSlot = existingSlot || await tx.timeSlot.create({
              data: {
                therapistId: recurring.therapistId,
                startTime: slotStart,
                endTime: slotEnd,
                isActive: true,
                isBooked: false
              }
            });

            // Check if booking already exists
            const existingBooking = await tx.booking.findFirst({
              where: {
                recurringBookingId: recurringBookingId,
                timeSlotId: timeSlot.id
              }
            });

            if (existingBooking) return null;

            // Create booking
            const booking = await tx.booking.create({
              data: {
                parentId: recurring.parentId,
                childId: recurring.childId,
                therapistId: recurring.therapistId,
                timeSlotId: timeSlot.id,
                recurringBookingId: recurringBookingId
              }
            });

            // Mark slot as booked
            await tx.timeSlot.update({
              where: { id: timeSlot.id },
              data: { isBooked: true }
            });

            // Create payment
            await tx.payment.create({
              data: {
                bookingId: booking.id,
                parentId: recurring.parentId,
                therapistId: recurring.therapistId,
                amount: finalFee
              }
            });

            // Create data access permission
            await tx.dataAccessPermission.create({
              data: {
                bookingId: booking.id,
                childId: recurring.childId,
                therapistId: recurring.therapistId,
                canViewDetails: false,
                accessStartTime: slotStart,
                accessEndTime: slotEnd
              }
            });

            return booking;
          });

          if (result) {
            bookingsToCreate.push(result);
          }
        } catch (bookingError: any) {
          console.error(`[RecurringBooking] Error creating booking for date ${date.toISOString()}:`, bookingError);
          // Continue with other dates even if one fails
          continue;
        }
      }

    return bookingsToCreate;
    } catch (error: any) {
      console.error('[RecurringBooking] Error in generateBookingsForRecurring:', error);
      throw error;
    }
  }

  /**
   * Get all recurring bookings for a parent
   */
  async getParentRecurringBookings(userId: string) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId }
    });
    if (!parent) throw new Error('Parent profile not found');

    return prisma.recurringBooking.findMany({
      where: { parentId: parent.id },
      include: {
        child: true,
        therapist: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        },
        bookings: {
          where: {
            status: BookingStatus.SCHEDULED
          },
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
  }

  /**
   * Get upcoming sessions for a recurring booking
   */
  async getUpcomingSessionsForRecurring(userId: string, recurringBookingId: string) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId }
    });
    if (!parent) throw new Error('Parent profile not found');

    const recurring = await prisma.recurringBooking.findFirst({
      where: {
        id: recurringBookingId,
        parentId: parent.id
      }
    });

    if (!recurring) {
      throw new Error('Recurring booking not found or does not belong to this parent');
    }

    const today = new Date();

    return prisma.booking.findMany({
      where: {
        recurringBookingId: recurringBookingId,
        status: BookingStatus.SCHEDULED,
        timeSlot: {
          startTime: {
            gte: today
          }
        }
      },
      include: {
        timeSlot: true,
        child: true,
        therapist: {
          select: {
            id: true,
            name: true,
            specialization: true
          }
        }
      },
      orderBy: {
        timeSlot: {
          startTime: 'asc'
        }
      }
    });
  }

  /**
   * Cancel a recurring booking (cancels all future sessions)
   */
  async cancelRecurringBooking(userId: string, recurringBookingId: string) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId }
    });
    if (!parent) throw new Error('Parent profile not found');

    const recurring = await prisma.recurringBooking.findFirst({
      where: {
        id: recurringBookingId,
        parentId: parent.id
      }
    });

    if (!recurring) {
      throw new Error('Recurring booking not found or does not belong to this parent');
    }

    if (!recurring.isActive) {
      throw new Error('Recurring booking is already cancelled');
    }

    const today = new Date();

    // Cancel all future bookings
    await prisma.booking.updateMany({
      where: {
        recurringBookingId: recurringBookingId,
        status: BookingStatus.SCHEDULED,
        timeSlot: {
          startTime: {
            gte: today
          }
        }
      },
      data: {
        status: BookingStatus.CANCELLED_BY_PARENT
      }
    });

    // Mark recurring booking as inactive
    const cancelled = await prisma.recurringBooking.update({
      where: { id: recurringBookingId },
      data: { isActive: false }
    });

    return cancelled;
  }
}

export const recurringBookingService = new RecurringBookingService();