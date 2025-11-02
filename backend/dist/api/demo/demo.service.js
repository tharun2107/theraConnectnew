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
exports.getAvailableDemoSlots = getAvailableDemoSlots;
exports.createDemoBooking = createDemoBooking;
exports.getDemoBookingById = getDemoBookingById;
exports.updateDemoBookingZoomDetails = updateDemoBookingZoomDetails;
exports.getAllDemoBookings = getAllDemoBookings;
exports.getDemoBookingHistory = getDemoBookingHistory;
exports.updateDemoBookingNotes = updateDemoBookingNotes;
exports.getAdminDemoSlots = getAdminDemoSlots;
exports.createAdminDemoSlots = createAdminDemoSlots;
exports.updateAdminDemoSlots = updateAdminDemoSlots;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
// Get available demo slots with timezone conversion
function getAvailableDemoSlots(userTimezone) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        // Get all active slots for current month
        const slots = yield prisma_1.default.demoSlot.findMany({
            where: {
                year: currentYear,
                month: currentMonth,
                isActive: true,
                date: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Only future dates
                },
            },
            orderBy: {
                date: 'asc',
            },
        });
        // Filter out weekends (Saturday=6, Sunday=0)
        const weekdaySlots = slots.filter((slot) => {
            const slotDate = new Date(slot.date);
            const dayOfWeek = slotDate.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
        });
        // Group by date and convert timezone if needed
        const groupedSlots = {};
        for (const slot of weekdaySlots) {
            const slotDate = new Date(slot.date);
            const dateKey = slotDate.toISOString().split('T')[0];
            // Check if slot is not already booked
            const bookingCount = yield prisma_1.default.demoBooking.count({
                where: {
                    slotDate: slotDate,
                    slotHour: slot.hour,
                    status: {
                        not: client_1.DemoBookingStatus.CANCELLED,
                    },
                },
            });
            if (bookingCount === 0) {
                // Convert timezone if user timezone is provided
                let displayTime = slot.timeString;
                if (userTimezone) {
                    // Admin timezone (default to server timezone or UTC)
                    const adminTimezone = process.env.ADMIN_TIMEZONE || 'UTC';
                    // Create date objects for conversion
                    const adminDate = new Date(`${dateKey}T${slot.timeString}:00`);
                    // Simple timezone conversion (you might want to use a library like date-fns-tz)
                    try {
                        const userDate = new Date(adminDate.toLocaleString('en-US', { timeZone: adminTimezone }));
                        const convertedDate = new Date(adminDate.toLocaleString('en-US', { timeZone: userTimezone }));
                        // Calculate offset
                        const offset = convertedDate.getTime() - userDate.getTime();
                        const adjustedDate = new Date(adminDate.getTime() + offset);
                        displayTime = adjustedDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        });
                    }
                    catch (e) {
                        // If timezone conversion fails, use original time
                        displayTime = slot.timeString;
                    }
                }
                if (!groupedSlots[dateKey]) {
                    groupedSlots[dateKey] = [];
                }
                groupedSlots[dateKey].push({
                    id: slot.id,
                    date: dateKey,
                    hour: slot.hour,
                    timeString: displayTime,
                    originalTimeString: slot.timeString,
                });
            }
        }
        // Convert to array format
        return Object.entries(groupedSlots).map(([date, slots]) => ({
            date,
            slots: slots.sort((a, b) => a.hour - b.hour),
        }));
    });
}
// Create demo booking
function createDemoBooking(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if slot is already booked
        const existingBooking = yield prisma_1.default.demoBooking.findFirst({
            where: {
                slotDate: new Date(data.slotDate),
                slotHour: data.slotHour,
                status: {
                    not: client_1.DemoBookingStatus.CANCELLED,
                },
            },
        });
        if (existingBooking) {
            throw new Error('This time slot is already booked');
        }
        // Find or create demo slot
        const slotDate = new Date(data.slotDate);
        let demoSlot = yield prisma_1.default.demoSlot.findFirst({
            where: {
                date: slotDate,
                hour: data.slotHour,
            },
        });
        if (!demoSlot) {
            // Create slot if it doesn't exist
            demoSlot = yield prisma_1.default.demoSlot.create({
                data: {
                    date: slotDate,
                    hour: data.slotHour,
                    timeString: data.slotTimeString,
                    month: slotDate.getMonth() + 1,
                    year: slotDate.getFullYear(),
                    isActive: true,
                },
            });
        }
        // Create booking
        const booking = yield prisma_1.default.demoBooking.create({
            data: {
                name: data.name,
                mobile: data.mobile,
                email: data.email,
                reason: data.reason,
                slotDate: slotDate,
                slotHour: data.slotHour,
                slotTimeString: data.slotTimeString,
                demoSlotId: demoSlot.id,
                status: client_1.DemoBookingStatus.SCHEDULED,
            },
        });
        return booking;
    });
}
// Get demo booking by ID
function getDemoBookingById(bookingId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.demoBooking.findUnique({
            where: { id: bookingId },
            include: { demoSlot: true },
        });
    });
}
// Update demo booking zoom details
function updateDemoBookingZoomDetails(bookingId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.demoBooking.update({
            where: { id: bookingId },
            data: {
                meetingId: data.meetingId,
                meetingPassword: data.meetingPassword,
                zoomLink: data.zoomLink,
            },
        });
    });
}
// Get all demo bookings
function getAllDemoBookings() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.demoBooking.findMany({
            include: { demoSlot: true },
            orderBy: { createdAt: 'desc' },
        });
    });
}
// Get demo booking history
function getDemoBookingHistory() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.demoBooking.findMany({
            include: { demoSlot: true },
            orderBy: { slotDate: 'desc' },
        });
    });
}
// Update demo booking notes
function updateDemoBookingNotes(bookingId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.demoBooking.update({
            where: { id: bookingId },
            data: {
                userQuery: data.userQuery,
                converted: data.converted !== undefined ? data.converted : undefined,
                additionalNotes: data.additionalNotes,
            },
        });
    });
}
// Get admin demo slots
function getAdminDemoSlots(month, year) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const targetMonth = month || now.getMonth() + 1;
        const targetYear = year || now.getFullYear();
        return yield prisma_1.default.demoSlot.findMany({
            where: {
                month: targetMonth,
                year: targetYear,
            },
            include: {
                _count: {
                    select: {
                        demoBookings: {
                            where: {
                                status: {
                                    not: client_1.DemoBookingStatus.CANCELLED,
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { date: 'asc' },
                { hour: 'asc' },
            ],
        });
    });
}
// Create admin demo slots for a month
function createAdminDemoSlots(month, year, slotTimes // Array of 8 time strings
) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delete existing slots for this month
        yield prisma_1.default.demoSlot.deleteMany({
            where: {
                month,
                year,
            },
        });
        // Get all dates in the month (excluding weekends)
        const dates = [];
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Not Sunday or Saturday
                dates.push(new Date(d));
            }
        }
        // Create slots for each weekday
        const slots = [];
        for (const date of dates) {
            for (const timeString of slotTimes) {
                const [hours, minutes] = timeString.split(':').map(Number);
                const hour = hours;
                slots.push({
                    date,
                    hour,
                    timeString,
                    isActive: true,
                    month,
                    year,
                });
            }
        }
        // Create all slots in batch
        yield prisma_1.default.demoSlot.createMany({
            data: slots,
            skipDuplicates: true,
        });
        return yield prisma_1.default.demoSlot.findMany({
            where: { month, year },
            orderBy: [{ date: 'asc' }, { hour: 'asc' }],
        });
    });
}
// Update admin demo slots for a month
function updateAdminDemoSlots(month, year, slotTimes // Array of 8 time strings
) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield createAdminDemoSlots(month, year, slotTimes);
    });
}
