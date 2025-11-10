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
exports.bookSlot = exports.generateAndGetAvailableSlots = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
/**
 * Checks if a given time falls within any of the therapist's breaks.
 * @param time - The Date object to check.
 * @param breaks - An array of therapist breaks.
 * @param date - The target date string 'YYYY-MM-DD' to construct break times.
 * @returns {boolean} - True if the time is within a break, false otherwise.
 */
function isTimeInBreak(time, breaks, date) {
    for (const breakItem of breaks) {
        const breakStart = new Date(`${date}T${breakItem.startTime}:00.000Z`);
        const breakEnd = new Date(`${date}T${breakItem.endTime}:00.000Z`);
        if (time >= breakStart && time < breakEnd) {
            return true;
        }
    }
    return false;
}
/**
 * The core function to generate slots for a day if they don't exist,
 * and then return the available ones.
 */
const generateAndGetAvailableSlots = (therapistId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const therapist = yield prisma_1.default.therapistProfile.findUnique({
        where: { id: therapistId },
        select: { availableSlotTimes: true, slotDurationInMinutes: true },
    });
    if (!therapist) {
        throw new Error('Therapist not found');
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
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    // If therapist has a leave on this date, no slots should be shown
    const hasLeave = yield prisma_1.default.therapistLeave.findFirst({
        where: { therapistId, date: dayStart },
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
            startTime: { gte: dayStart, lte: dayEnd },
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
    // Fetch and return all *available* slots for the day
    const slots = yield prisma_1.default.timeSlot.findMany({
        where: {
            therapistId,
            isBooked: false,
            isActive: true,
            startTime: { gte: dayStart, lte: dayEnd },
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
    return filteredSlots;
});
exports.generateAndGetAvailableSlots = generateAndGetAvailableSlots;
/**
 * Books a time slot for a child in a concurrency-safe transaction.
 */
const bookSlot = (parentId, childId, timeSlotId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Step 1: Lock the TimeSlot row to prevent double booking.
        // findFirstOrThrow ensures that if the slot is already booked or doesn't exist, the transaction fails.
        const slot = yield tx.timeSlot.findFirstOrThrow({
            where: { id: timeSlotId, isBooked: false },
            include: { therapist: { include: { user: true } } },
        });
        // Step 1.5: Enforce booking window: within next 30 days
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (slot.startTime > thirtyDaysFromNow) {
            throw new Error('Bookings are allowed only within the next 30 days.');
        }
        // Check if the booking date is a weekend (Saturday or Sunday)
        const bookingDate = new Date(slot.startTime);
        const dayOfWeek = bookingDate.getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            throw new Error('Bookings are not available on weekends (Saturday and Sunday)');
        }
        // Step 2: Mark the slot as booked
        yield tx.timeSlot.update({
            where: { id: timeSlotId },
            data: { isBooked: true },
        });
        // Step 3: Verify the child belongs to the parent
        const child = yield tx.child.findFirstOrThrow({
            where: { id: childId, parentId },
            include: { parent: { include: { user: true } } },
        });
        // Step 4: Create the booking record
        const newBooking = yield tx.booking.create({
            data: {
                parentId,
                childId,
                therapistId: slot.therapistId,
                timeSlotId: slot.id,
            },
        });
        // Step 5 & 6 (optional but good practice): Create Payment and Permissions
        // ... (logic for payment and data access permission creation would go here)
        // After transaction succeeds, send notifications
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotificationBookingConfirmed({
        //   userId: slot.therapist.user.id,
        //   message: `New booking confirmed with ${child.name} on ${slot.startTime.toLocaleDateString()}.`,
        //   sendAt: new Date()
        // });
        // await sendNotificationBookingConfirmed({
        //   userId: child.parent.user.id,
        //   message: `Your booking for ${child.name} is confirmed for ${slot.startTime.toLocaleString()}.`,
        //   sendAt: new Date()
        // });
        return newBooking;
    }));
});
exports.bookSlot = bookSlot;
