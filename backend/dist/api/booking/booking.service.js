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
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringBookingService = exports.RecurringBookingService = exports.getMyBookings = exports.createBooking = exports.getAvailableSlots = exports.markSessionCompleted = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../services/notification.service");
const client_2 = require("@prisma/client");
const date_fns_tz_1 = require("date-fns-tz");
const date_fns_1 = require("date-fns");
const countWorkingDays_1 = require("../../services/countWorkingDays");
const prisma = new client_2.PrismaClient();
const markSessionCompleted = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma.booking.findUnique({
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
    const updatedBooking = yield prisma.booking.update({
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
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    console.log('[booking.service.getAvailableSlots] window', { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString(), therapistId });
    const slots = yield prisma.timeSlot.findMany({
        where: {
            therapistId,
            isBooked: false,
            isActive: true,
            startTime: { gte: startOfDay, lte: endOfDay },
            therapist: { status: client_1.TherapistStatus.ACTIVE },
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
});
exports.getAvailableSlots = getAvailableSlots;
const createBooking = (parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { childId, timeSlotId } = input;
    const timeSlot = yield prisma.timeSlot.findFirst({
        where: { id: timeSlotId, isBooked: false },
        include: { therapist: true },
    });
    if (!timeSlot)
        throw new Error('This time slot is not available.');
    if (timeSlot.therapist.status !== client_1.TherapistStatus.ACTIVE) {
        throw new Error('This therapist is not available for booking.');
    }
    const child = yield prisma.child.findFirst({
        where: { id: childId, parentId },
    });
    if (!child)
        throw new Error('Child not found or does not belong to this parent.');
    const parent = yield prisma.parentProfile.findUnique({ where: { id: parentId } });
    const finalFee = (_a = parent === null || parent === void 0 ? void 0 : parent.customFee) !== null && _a !== void 0 ? _a : timeSlot.therapist.baseCostPerSession;
    const booking = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
    const bookings = yield prisma.booking.findMany({
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
class RecurringBookingService {
    /**
     * Create a recurring booking for all working days (Mon-Fri) for one month.
     */
    createRecurringBooking(parentUserId, bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Get Parent and Therapist Timezones
            const parent = yield prisma.user.findUnique({
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
            if (!parent || !parent.parentProfile)
                throw new Error('Parent profile not found');
            if (parent.parentProfile.children.length === 0)
                throw new Error('Child not found or does not belong to this parent');
            const parentId = parent.parentProfile.id;
            const therapist = yield prisma.therapistProfile.findUnique({
                where: { id: bookingData.therapistId },
                include: {
                    user: { select: { timezone: true } }
                }
            });
            if (!therapist || !therapist.user)
                throw new Error('Therapist not found');
            if (therapist.status !== 'ACTIVE')
                throw new Error('Therapist is not available for bookings');
            const therapistTimezone = therapist.user.timezone;
            // 2. Calculate Date Range and Required Working Days
            const { startDate, endDate, workingDays } = (0, countWorkingDays_1.countWorkingDays)(bookingData.startDate);
            if ((0, date_fns_1.isBefore)(startDate, (0, date_fns_1.startOfDay)(new Date()))) {
                throw new Error('Start date cannot be in the past');
            }
            if (workingDays === 0) {
                throw new Error('No working days found in the selected month.');
            }
            // 3. Find all *required* UTC slots
            const requiredUtcSlots = this.getRequiredUtcSlots(startDate, endDate, bookingData.slotTime, therapistTimezone);
            if (requiredUtcSlots.length !== workingDays) {
                // This is a sanity check, they should match
                throw new Error('Working day count and slot calculation mismatch.');
            }
            // 4. Check availability of all required slots in one query
            const availableSlots = yield prisma.timeSlot.findMany({
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
                throw new Error(`Cannot create recurring booking. Only ${availableSlots.length} out of ${workingDays} required working days are available at ${bookingData.slotTime}.`);
            }
            // 6. Create recurring booking and all individual bookings in a transaction
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // A. Create RecurringBooking master record
                const recurring = yield tx.recurringBooking.create({
                    data: {
                        parentId: parentId,
                        childId: bookingData.childId,
                        therapistId: bookingData.therapistId,
                        recurrencePattern: client_2.RecurrencePattern.DAILY, // We use DAILY, but logic filters for weekdays
                        slotTime: bookingData.slotTime, // Store local time for reference
                        startDate: startDate,
                        endDate: endDate,
                        isActive: true
                    }
                });
                // B. Create individual Booking records
                for (const slot of availableSlots) {
                    // Mark slot as booked
                    yield tx.timeSlot.update({
                        where: { id: slot.id },
                        data: { isBooked: true }
                    });
                    // Create booking
                    const booking = yield tx.booking.create({
                        data: {
                            parentId: parentId,
                            childId: bookingData.childId,
                            therapistId: bookingData.therapistId,
                            timeSlotId: slot.id,
                            recurringBookingId: recurring.id,
                            status: client_2.BookingStatus.SCHEDULED
                        }
                    });
                    // Create payment record
                    yield tx.payment.create({
                        data: {
                            bookingId: booking.id,
                            parentId: parentId,
                            therapistId: bookingData.therapistId,
                            amount: therapist.baseCostPerSession,
                            status: client_1.PaymentStatus.PENDING
                        }
                    });
                }
                return recurring;
            }));
        });
    }
    /**
     * Helper to get all required UTC start times for working days in a date range.
     */
    getRequiredUtcSlots(startDate, endDate, slotTime, // "HH:mm"
    therapistTimezone) {
        const requiredSlots = [];
        const [hours, minutes] = slotTime.split(':').map(Number);
        for (let d = new Date(startDate); (0, date_fns_1.isBefore)(d, endDate); d.setDate(d.getDate() + 1)) {
            const dayOfWeek = (0, date_fns_1.getDay)(d);
            // Check if it's a working day (Mon-Fri)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Create the local date and time for the therapist
                const localDateTime = new Date(d);
                localDateTime.setHours(hours, minutes, 0, 0);
                // Convert to UTC
                const utcStartTime = (0, date_fns_tz_1.fromZonedTime)(localDateTime, therapistTimezone);
                requiredSlots.push(utcStartTime);
            }
        }
        return requiredSlots;
    }
    /**
     * Get all recurring bookings for a parent
     */
    getParentRecurringBookings(parentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma.user.findUnique({
                where: { id: parentUserId },
                select: {
                    timezone: true,
                    parentProfile: { select: { id: true } }
                }
            });
            if (!parent || !parent.parentProfile) {
                throw new Error('Parent profile not found');
            }
            const recurringBookings = yield prisma.recurringBooking.findMany({
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
                var _a;
                const now = new Date();
                const totalSessions = recurring.bookings.length;
                const completedSessions = recurring.bookings.filter(b => b.status === client_2.BookingStatus.COMPLETED).length;
                const upcomingBookings = recurring.bookings.filter(b => (0, date_fns_1.isAfter)(b.timeSlot.startTime, now) && b.status === client_2.BookingStatus.SCHEDULED);
                const upcomingSessions = upcomingBookings.length;
                const nextSessionDate = (_a = upcomingBookings[0]) === null || _a === void 0 ? void 0 : _a.timeSlot.startTime;
                return Object.assign(Object.assign({}, recurring), { totalSessions,
                    completedSessions,
                    upcomingSessions,
                    nextSessionDate, displaySlotTime: this.formatTimeDisplay(recurring.slotTime), displayDateRange: `${(0, date_fns_1.format)(recurring.startDate, 'MMM dd')} - ${(0, date_fns_1.format)(recurring.endDate, 'MMM dd, yyyy')}` });
            });
        });
    }
    /**
     * Cancel a recurring booking
     */
    cancelRecurringBooking(parentUserId, recurringBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma.user.findUnique({
                where: { id: parentUserId },
                select: {
                    parentProfile: { select: { id: true } }
                }
            });
            if (!parent || !parent.parentProfile) {
                throw new Error('Parent profile not found');
            }
            const parentId = parent.parentProfile.id;
            const recurringBooking = yield prisma.recurringBooking.findUnique({
                where: { id: recurringBookingId },
                include: {
                    bookings: {
                        include: {
                            timeSlot: true
                        }
                    }
                }
            });
            if (!recurringBooking)
                throw new Error('Recurring booking not found');
            if (recurringBooking.parentId !== parentId)
                throw new Error('This recurring booking does not belong to you');
            if (!recurringBooking.isActive)
                throw new Error('This recurring booking is already cancelled');
            return prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const now = new Date();
                const futureBookings = recurringBooking.bookings.filter(b => (0, date_fns_1.isAfter)(b.timeSlot.startTime, now) && b.status === client_2.BookingStatus.SCHEDULED);
                for (const booking of futureBookings) {
                    yield tx.timeSlot.update({
                        where: { id: booking.timeSlotId },
                        data: { isBooked: false }
                    });
                    yield tx.booking.update({
                        where: { id: booking.id },
                        data: { status: client_2.BookingStatus.CANCELLED_BY_PARENT }
                    });
                }
                return tx.recurringBooking.update({
                    where: { id: recurringBookingId },
                    data: { isActive: false }
                });
            }));
        });
    }
    /**
     * Get upcoming sessions for a recurring booking
     */
    getUpcomingSessionsForRecurring(parentUserId, recurringBookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield prisma.user.findUnique({
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
            const bookings = yield prisma.booking.findMany({
                where: {
                    recurringBookingId: recurringBookingId,
                    parentId: parent.parentProfile.id,
                    status: client_2.BookingStatus.SCHEDULED,
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
                const localStartTime = (0, date_fns_tz_1.toZonedTime)(booking.timeSlot.startTime, parentTimezone);
                const localEndTime = (0, date_fns_tz_1.toZonedTime)(booking.timeSlot.endTime, parentTimezone);
                return Object.assign(Object.assign({}, booking), { displayDate: (0, date_fns_1.format)(localStartTime, 'EEEE, MMMM dd, yyyy'), displayTime: `${(0, date_fns_1.format)(localStartTime, 'hh:mm a')} - ${(0, date_fns_1.format)(localEndTime, 'hh:mm a')}`, displayStartTime: (0, date_fns_1.format)(localStartTime, 'yyyy-MM-dd HH:mm') });
            });
        });
    }
    /** Helper: Format time for display */
    formatTimeDisplay(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        return (0, date_fns_1.format)(date, 'hh:mm a');
    }
}
exports.RecurringBookingService = RecurringBookingService;
exports.recurringBookingService = new RecurringBookingService();
