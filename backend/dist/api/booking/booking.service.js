"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringBookingService = exports.RecurringBookingService = exports.getMyBookings = exports.createBooking = exports.getAvailableSlots = exports.markSessionCompleted = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../services/notification.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const markSessionCompleted = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
        include: {
            parent: { include: { user: true } },
            therapist: { include: { user: true } },
            child: true,
        },
    });
    if (!booking) {
        throw new Error('Booking not found');
    }
    if (booking.status !== 'SCHEDULED') {
        throw new Error('Session can only be completed if it was scheduled');
    }
    const updatedBooking = yield prisma_1.default.booking.update({
        where: { id: bookingId },
        data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            isCompleted: true,
        },
        include: {
            parent: { include: { user: true } },
            therapist: { include: { user: true } },
            child: true,
        },
    });
    // Send notifications
    yield (0, notification_service_1.sendNotificationAfterAnEventSessionCompleted)({
        userId: booking.parent.userId,
        message: `Session with ${booking.therapist.name} for ${booking.child.name} has been completed. Please provide your feedback.`,
        sendAt: new Date()
    });
    yield (0, notification_service_1.sendNotificationAfterAnEventSessionCompleted)({
        userId: booking.therapist.userId,
        message: `Session with ${booking.child.name} has been completed. Please create a session report.`,
        sendAt: new Date()
    });
    return updatedBooking;
});
exports.markSessionCompleted = markSessionCompleted;
const getAvailableSlots = (therapistId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const therapist = yield prisma_1.default.therapistProfile.findUnique({
        where: { id: therapistId, status: client_1.TherapistStatus.ACTIVE },
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
    const hasLeave = yield prisma_1.default.therapistLeave.findFirst({
        where: { therapistId, date: startOfDay },
    });
    if (hasLeave) {
        return [];
    }
    const slotDurationInMinutes = 60; // Fixed to 1 hour per session
    // Delete any existing slots for this date that don't match availableSlotTimes
    // This ensures we don't have old slots from previous systems
    yield prisma_1.default.timeSlot.deleteMany({
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
        yield prisma_1.default.timeSlot.createMany({ data: slotsToCreate });
    }
    // Return available slots for the date (only those matching availableSlotTimes)
    const slots = yield prisma_1.default.timeSlot.findMany({
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
    const filteredSlots = slots.filter((slot) => {
        const slotDate = new Date(slot.startTime);
        const slotHours = slotDate.getUTCHours();
        const slotMinutes = slotDate.getUTCMinutes();
        const slotTimeStr = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        return validSlotTimes.has(slotTimeStr);
    });
    console.log('[booking.service.getAvailableSlots] therapist availableSlotTimes:', therapist.availableSlotTimes);
    console.log('[booking.service.getAvailableSlots] created', slotsToCreate.length, 'new slots');
    console.log('[booking.service.getAvailableSlots] found', filteredSlots.length, 'valid slots out of', slots.length, 'total');
    filteredSlots.forEach((slot) => {
        const slotDate = new Date(slot.startTime);
        const slotHours = slotDate.getUTCHours();
        const slotMinutes = slotDate.getUTCMinutes();
        const slotTimeStr = `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        console.log('[booking.service.getAvailableSlots] slot:', slotTimeStr, 'startTime:', slot.startTime.toISOString(), 'local:', slotDate.toLocaleString());
    });
    return filteredSlots;
});
exports.getAvailableSlots = getAvailableSlots;
const createBooking = (parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { childId, timeSlotId } = input;
    const timeSlot = yield prisma_1.default.timeSlot.findFirst({
        where: { id: timeSlotId, isBooked: false },
        include: { therapist: true },
    });
    if (!timeSlot)
        throw new Error('This time slot is not available.');
    if (timeSlot.therapist.status !== client_1.TherapistStatus.ACTIVE) {
        throw new Error('This therapist is not available for booking.');
    }
    const child = yield prisma_1.default.child.findFirst({
        where: { id: childId, parentId },
    });
    if (!child)
        throw new Error('Child not found or does not belong to this parent.');
    const parent = yield prisma_1.default.parentProfile.findUnique({ where: { id: parentId } });
    const finalFee = (_a = parent === null || parent === void 0 ? void 0 : parent.customFee) !== null && _a !== void 0 ? _a : timeSlot.therapist.baseCostPerSession;
    const booking = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.timeSlot.update({ where: { id: timeSlotId }, data: { isBooked: true } });
        const newBooking = yield tx.booking.create({
            data: {
                parentId,
                childId,
                therapistId: timeSlot.therapistId,
                timeSlotId,
            },
        });
        yield tx.payment.create({
            data: {
                bookingId: newBooking.id,
                parentId,
                therapistId: timeSlot.therapistId,
                amount: finalFee,
            }
        });
        yield tx.dataAccessPermission.create({
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
    }));
    yield (0, notification_service_1.sendNotificationBookingConfirmed)({
        userId: timeSlot.therapist.userId,
        message: `You have a new booking with ${child.name} on ${timeSlot.startTime.toLocaleString()}.`,
        sendAt: new Date()
    });
    yield (0, notification_service_1.sendNotificationBookingConfirmed)({
        userId: parent.userId,
        message: `Your booking for ${child.name} is confirmed for ${timeSlot.startTime.toLocaleString()}.`,
        sendAt: new Date()
    });
    return booking;
});
exports.createBooking = createBooking;
const getMyBookings = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = role === client_1.Role.PARENT
        ? { parent: { userId } }
        : { therapist: { userId, status: client_1.TherapistStatus.ACTIVE } };
    // Include child information for parents
    const includeForParent = {
        child: true,
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
        SessionFeedback: true,
        sessionReport: true,
        ConsentRequest: true,
    };
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
    };
    const bookings = yield prisma_1.default.booking.findMany({
        where: whereClause,
        include: role === client_1.Role.PARENT ? includeForParent : includeForTherapist,
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
    // For therapists, filter out child details if consent is not given
    if (role === client_1.Role.THERAPIST) {
        return bookings.map((booking) => {
            var _a, _b, _c;
            const hasConsent = ((_a = booking.ConsentRequest) === null || _a === void 0 ? void 0 : _a.status) === 'GRANTED';
            return Object.assign(Object.assign({}, booking), { child: hasConsent ? booking.child : {
                    id: (_b = booking.child) === null || _b === void 0 ? void 0 : _b.id,
                    name: (_c = booking.child) === null || _c === void 0 ? void 0 : _c.name,
                    age: undefined,
                    condition: undefined,
                    notes: undefined,
                    address: undefined,
                } });
        });
    }
    return bookings;
});
exports.getMyBookings = getMyBookings;
// ============================================
// RECURRING BOOKING SERVICE
// ============================================
const client_2 = require("@prisma/client");
const date_fns_1 = require("date-fns");
class RecurringBookingService {
    /**
     * Create a recurring booking and generate individual bookings
     */
    createRecurringBooking(userId, input) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get parent profile
            const parent = yield prisma_1.default.parentProfile.findUnique({
                where: { userId },
                include: { user: true }
            });
            if (!parent)
                throw new Error('Parent profile not found');
            // Verify child belongs to parent
            const child = yield prisma_1.default.child.findFirst({
                where: { id: input.childId, parentId: parent.id }
            });
            if (!child)
                throw new Error('Child not found or does not belong to this parent');
            // Verify therapist exists and is active
            const therapist = yield prisma_1.default.therapistProfile.findUnique({
                where: { id: input.therapistId, status: client_1.TherapistStatus.ACTIVE },
                include: { user: true }
            });
            if (!therapist)
                throw new Error('Therapist not found or not active');
            // Validate dates
            const startDate = new Date(input.startDate);
            const endDate = new Date(input.endDate);
            const today = (0, date_fns_1.startOfDay)(new Date());
            if (startDate < today) {
                throw new Error('Start date cannot be in the past');
            }
            if (endDate < startDate) {
                throw new Error('End date must be after start date');
            }
            // Validate recurrence pattern
            if (input.recurrencePattern === client_2.RecurrencePattern.WEEKLY && !input.dayOfWeek) {
                throw new Error('dayOfWeek is required for WEEKLY recurrence pattern');
            }
            // Check if child already has an active recurring booking with this therapist
            const existingRecurring = yield prisma_1.default.recurringBooking.findFirst({
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
            const recurringBooking = yield prisma_1.default.recurringBooking.create({
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
            yield this.generateBookingsForRecurring(recurringBooking.id);
            return recurringBooking;
        });
    }
    /**
     * Generate individual bookings from a recurring booking
     */
    generateBookingsForRecurring(recurringBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const recurring = yield prisma_1.default.recurringBooking.findUnique({
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
            const startDate = new Date(recurring.startDate);
            const endDate = new Date(recurring.endDate);
            const today = (0, date_fns_1.startOfDay)(new Date());
            // Generate dates based on recurrence pattern
            const dates = [];
            if (recurring.recurrencePattern === client_2.RecurrencePattern.DAILY) {
                // Generate all dates in range (excluding weekends)
                const allDays = (0, date_fns_1.eachDayOfInterval)({ start: startDate, end: endDate });
                dates.push(...allDays.filter(day => !(0, date_fns_1.isWeekend)(day) && day >= today));
            }
            else if (recurring.recurrencePattern === client_2.RecurrencePattern.WEEKLY && recurring.dayOfWeek) {
                // Generate dates for specific day of week
                const dayOfWeekMap = {
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
                    currentDate = (0, date_fns_1.addDays)(currentDate, 1);
                }
            }
            // Parse slot time (HH:mm)
            const [hours, minutes] = recurring.slotTime.split(':').map(Number);
            const slotDurationMinutes = recurring.therapist.slotDurationInMinutes || 60;
            // Create bookings for each date in a transaction
            const finalFee = (_a = recurring.parent.customFee) !== null && _a !== void 0 ? _a : recurring.therapist.baseCostPerSession;
            const bookingsToCreate = [];
            for (const date of dates) {
                // Check if therapist has leave on this date
                const hasLeave = yield prisma_1.default.therapistLeave.findFirst({
                    where: {
                        therapistId: recurring.therapistId,
                        date: date,
                        status: 'APPROVED'
                    }
                });
                if (hasLeave)
                    continue;
                // Create time slot
                const slotStart = new Date(date);
                slotStart.setHours(hours, minutes, 0, 0);
                const slotEnd = new Date(slotStart.getTime() + slotDurationMinutes * 60000);
                // Check if slot already exists
                const existingSlot = yield prisma_1.default.timeSlot.findFirst({
                    where: {
                        therapistId: recurring.therapistId,
                        startTime: slotStart,
                        endTime: slotEnd
                    }
                });
                if (existingSlot && existingSlot.isBooked) {
                    continue; // Skip if already booked
                }
                // Create booking in transaction
                const result = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const timeSlot = existingSlot || (yield tx.timeSlot.create({
                        data: {
                            therapistId: recurring.therapistId,
                            startTime: slotStart,
                            endTime: slotEnd,
                            isActive: true,
                            isBooked: false
                        }
                    }));
                    // Check if booking already exists
                    const existingBooking = yield tx.booking.findFirst({
                        where: {
                            recurringBookingId: recurringBookingId,
                            timeSlotId: timeSlot.id
                        }
                    });
                    if (existingBooking)
                        return null;
                    // Create booking
                    const booking = yield tx.booking.create({
                        data: {
                            parentId: recurring.parentId,
                            childId: recurring.childId,
                            therapistId: recurring.therapistId,
                            timeSlotId: timeSlot.id,
                            recurringBookingId: recurringBookingId
                        }
                    });
                    // Mark slot as booked
                    yield tx.timeSlot.update({
                        where: { id: timeSlot.id },
                        data: { isBooked: true }
                    });
                    // Create payment
                    yield tx.payment.create({
                        data: {
                            bookingId: booking.id,
                            parentId: recurring.parentId,
                            therapistId: recurring.therapistId,
                            amount: finalFee
                        }
                    });
                    // Create data access permission
                    yield tx.dataAccessPermission.create({
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
                }));
                if (result) {
                    bookingsToCreate.push(result);
                }
            }
            return bookingsToCreate;
        });
    }
    /**
     * Get all recurring bookings for a parent
     */
    getParentRecurringBookings(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma_1.default.parentProfile.findUnique({
                where: { userId }
            });
            if (!parent)
                throw new Error('Parent profile not found');
            return prisma_1.default.recurringBooking.findMany({
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
                            status: client_1.BookingStatus.SCHEDULED
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
        });
    }
    /**
     * Get upcoming sessions for a recurring booking
     */
    getUpcomingSessionsForRecurring(userId, recurringBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma_1.default.parentProfile.findUnique({
                where: { userId }
            });
            if (!parent)
                throw new Error('Parent profile not found');
            const recurring = yield prisma_1.default.recurringBooking.findFirst({
                where: {
                    id: recurringBookingId,
                    parentId: parent.id
                }
            });
            if (!recurring) {
                throw new Error('Recurring booking not found or does not belong to this parent');
            }
            const today = new Date();
            return prisma_1.default.booking.findMany({
                where: {
                    recurringBookingId: recurringBookingId,
                    status: client_1.BookingStatus.SCHEDULED,
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
        });
    }
    /**
     * Cancel a recurring booking (cancels all future sessions)
     */
    cancelRecurringBooking(userId, recurringBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma_1.default.parentProfile.findUnique({
                where: { userId }
            });
            if (!parent)
                throw new Error('Parent profile not found');
            const recurring = yield prisma_1.default.recurringBooking.findFirst({
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
            yield prisma_1.default.booking.updateMany({
                where: {
                    recurringBookingId: recurringBookingId,
                    status: client_1.BookingStatus.SCHEDULED,
                    timeSlot: {
                        startTime: {
                            gte: today
                        }
                    }
                },
                data: {
                    status: client_1.BookingStatus.CANCELLED_BY_PARENT
                }
            });
            // Mark recurring booking as inactive
            const cancelled = yield prisma_1.default.recurringBooking.update({
                where: { id: recurringBookingId },
                data: { isActive: false }
            });
            return cancelled;
        });
    }
}
exports.RecurringBookingService = RecurringBookingService;
exports.recurringBookingService = new RecurringBookingService();
