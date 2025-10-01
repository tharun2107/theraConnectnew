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
const notification_service_1 = require("../../services/notification.service");
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
        include: { breaks: true },
    });
    if (!therapist) {
        throw new Error('Therapist not found');
    }
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    // 1. Check if slots already exist for this day
    const existingSlotsCount = yield prisma_1.default.timeSlot.count({
        where: { therapistId, startTime: { gte: dayStart, lte: dayEnd } },
    });
    // 2. If no slots exist, generate them
    if (existingSlotsCount === 0) {
        const slotsToCreate = [];
        let currentSlotTime = new Date(`${date}T${therapist.scheduleStartTime}:00.000Z`);
        const { slotDurationInMinutes, breaks, maxSlotsPerDay } = therapist;
        while (slotsToCreate.length < maxSlotsPerDay) {
            const slotEndTime = new Date(currentSlotTime.getTime() + slotDurationInMinutes * 60000);
            // Skip slot if it starts within a break
            if (!isTimeInBreak(currentSlotTime, breaks, date)) {
                slotsToCreate.push({
                    therapistId,
                    startTime: new Date(currentSlotTime),
                    endTime: slotEndTime,
                });
            }
            // Move to the start of the next potential slot
            currentSlotTime = slotEndTime;
        }
        if (slotsToCreate.length > 0) {
            yield prisma_1.default.timeSlot.createMany({ data: slotsToCreate });
        }
    }
    // 3. Fetch and return all *available* slots for the day
    return prisma_1.default.timeSlot.findMany({
        where: {
            therapistId,
            isBooked: false,
            startTime: { gte: dayStart, lte: dayEnd },
        },
        orderBy: { startTime: 'asc' },
    });
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
        yield (0, notification_service_1.sendNotification)({
            userId: slot.therapist.user.id,
            type: 'BOOKING_CONFIRMED',
            message: `New booking confirmed with ${child.name} on ${slot.startTime.toLocaleDateString()}.`,
        });
        yield (0, notification_service_1.sendNotification)({
            userId: child.parent.user.id,
            type: 'BOOKING_CONFIRMED',
            message: `Your booking for ${child.name} is confirmed for ${slot.startTime.toLocaleString()}.`,
        });
        return newBooking;
    }));
});
exports.bookSlot = bookSlot;
