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
exports.getMyBookings = exports.createBooking = exports.getAvailableSlots = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../services/notification.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAvailableSlots = (therapistId, date) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    console.log('[booking.service.getAvailableSlots] window', { startOfDay: startOfDay.toISOString(), endOfDay: endOfDay.toISOString(), therapistId });
    const slots = yield prisma_1.default.timeSlot.findMany({
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
    yield (0, notification_service_1.sendNotification)({
        userId: timeSlot.therapist.userId,
        type: 'BOOKING_CONFIRMED',
        message: `You have a new booking with ${child.name} on ${timeSlot.startTime.toLocaleString()}.`
    });
    yield (0, notification_service_1.sendNotification)({
        userId: parent.userId,
        type: 'BOOKING_CONFIRMED',
        message: `Your booking for ${child.name} is confirmed for ${timeSlot.startTime.toLocaleString()}.`
    });
    return booking;
});
exports.createBooking = createBooking;
const getMyBookings = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = role === client_1.Role.PARENT
        ? { parent: { userId } }
        : { therapist: { userId, status: client_1.TherapistStatus.ACTIVE } };
    // Hide child information from therapists
    const includeForParent = {
        child: true,
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
    };
    const includeForTherapist = {
        // child intentionally omitted
        therapist: { select: { name: true, specialization: true } },
        parent: { select: { name: true } },
        timeSlot: true,
    };
    return prisma_1.default.booking.findMany({
        where: whereClause,
        include: role === client_1.Role.PARENT ? includeForParent : includeForTherapist,
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
});
exports.getMyBookings = getMyBookings;
