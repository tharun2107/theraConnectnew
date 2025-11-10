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
exports.rejectLeaveRequest = exports.approveLeaveRequest = exports.listLeaveRequests = exports.updatePlatformSettings = exports.getPlatformSettings = exports.updateProfile = exports.getProfile = exports.getAllBookings = exports.getChildSessions = exports.getAllChildren = exports.getTherapistSessions = exports.updateTherapistStatus = exports.getAllTherapists = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../services/notification.service");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAllTherapists = () => __awaiter(void 0, void 0, void 0, function* () {
    // Auto-activate legacy pending therapists since admin-created profiles shouldn't require approval
    yield prisma_1.default.therapistProfile.updateMany({
        where: { status: client_1.TherapistStatus.PENDING_VERIFICATION },
        data: { status: client_1.TherapistStatus.ACTIVE },
    });
    return prisma_1.default.therapistProfile.findMany({
        include: { user: { select: { email: true, createdAt: true } } },
    });
});
exports.getAllTherapists = getAllTherapists;
const updateTherapistStatus = (therapistId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTherapist = yield prisma_1.default.therapistProfile.update({
        where: { id: therapistId },
        data: { status },
    });
    if (status === 'ACTIVE') {
        yield (0, notification_service_1.therapistAccountApproved)({
            userId: updatedTherapist.userId,
            message: 'Congratulations! Your profile has been approved by the admin.',
            sendAt: new Date(),
        });
    }
    return updatedTherapist;
});
exports.updateTherapistStatus = updateTherapistStatus;
const getTherapistSessions = (therapistId) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield prisma_1.default.booking.findMany({
        where: { therapistId },
        include: {
            child: true,
            parent: { include: { user: true } },
            therapist: { include: { user: true } },
            timeSlot: true,
            SessionFeedback: true,
            sessionReport: true,
            ConsentRequest: true,
        },
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
    return sessions;
});
exports.getTherapistSessions = getTherapistSessions;
const getAllChildren = () => __awaiter(void 0, void 0, void 0, function* () {
    const children = yield prisma_1.default.child.findMany({
        include: {
            parent: { include: { user: true } },
        },
        orderBy: { name: 'asc' },
    });
    return children;
});
exports.getAllChildren = getAllChildren;
const getChildSessions = (childId) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield prisma_1.default.booking.findMany({
        where: { childId },
        include: {
            child: true,
            parent: { include: { user: true } },
            therapist: { include: { user: true } },
            timeSlot: true,
            SessionFeedback: true,
            sessionReport: true,
            ConsentRequest: true,
        },
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
    return sessions;
});
exports.getChildSessions = getChildSessions;
const getAllBookings = () => __awaiter(void 0, void 0, void 0, function* () {
    const bookings = yield prisma_1.default.booking.findMany({
        include: {
            child: true,
            parent: { include: { user: true } },
            therapist: { include: { user: true } },
            timeSlot: true,
            SessionFeedback: true,
            sessionReport: true,
            ConsentRequest: true,
        },
        orderBy: { timeSlot: { startTime: 'desc' } },
    });
    return bookings;
});
exports.getAllBookings = getAllBookings;
const getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    let admin = yield prisma_1.default.adminProfile.findUnique({
        where: { userId },
        include: { user: true },
    });
    // If admin profile doesn't exist, create it (for existing admins)
    if (!admin) {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user || user.role !== 'ADMIN') {
            throw new Error('Admin profile not found');
        }
        // Create the admin profile
        admin = yield prisma_1.default.adminProfile.create({
            data: { userId },
            include: { user: true },
        });
    }
    // Return a flattened structure matching what the frontend expects
    return {
        id: admin.id,
        name: admin.user.name || '',
        email: admin.user.email,
        phone: admin.user.phone || '',
        role: admin.user.role,
        createdAt: admin.user.createdAt,
    };
});
exports.getProfile = getProfile;
const updateProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Update the user's name and phone, not the admin profile (AdminProfile doesn't have these fields)
    const updatedUser = yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            phone: data.phone,
        },
        include: { adminProfile: true },
    });
    // Return a flattened structure matching what the frontend expects
    return {
        id: ((_a = updatedUser.adminProfile) === null || _a === void 0 ? void 0 : _a.id) || '',
        name: updatedUser.name || '',
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
    };
});
exports.updateProfile = updateProfile;
const getPlatformSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    // For now, return default settings
    // In a real app, you'd store these in a database table
    return {
        id: '1',
        platformName: 'Therabee',
        platformEmail: 'admin@therabee.com',
        platformPhone: '+1 (555) 123-4567',
        maintenanceMode: false,
        allowNewRegistrations: true,
        emailNotifications: true,
        sessionReminderHours: 24,
        maxSessionsPerDay: 8,
        defaultSessionDuration: 60,
        platformDescription: 'Professional therapy platform connecting families with qualified therapists.',
        termsOfService: 'Terms of service content...',
        privacyPolicy: 'Privacy policy content...',
    };
});
exports.getPlatformSettings = getPlatformSettings;
const updatePlatformSettings = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // For now, just return the updated data
    // In a real app, you'd save these to a database table
    return data;
});
exports.updatePlatformSettings = updatePlatformSettings;
const listLeaveRequests = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.therapistLeave.findMany({
        where: {},
        include: { therapist: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
    });
});
exports.listLeaveRequests = listLeaveRequests;
const approveLeaveRequest = (leaveId) => __awaiter(void 0, void 0, void 0, function* () {
    const leave = yield prisma_1.default.therapistLeave.findUnique({ where: { id: leaveId } });
    if (!leave)
        throw new Error('Leave not found');
    if (leave.status === client_1.LeaveStatus.APPROVED)
        return leave;
    const startOfDay = leave.date;
    const endOfDay = new Date(new Date(startOfDay).setUTCHours(23, 59, 59, 999));
    const affectedBookings = yield prisma_1.default.booking.findMany({
        where: {
            therapistId: leave.therapistId,
            status: 'SCHEDULED',
            timeSlot: { startTime: { gte: startOfDay, lte: endOfDay } },
        },
        include: { parent: { include: { user: true } }, timeSlot: true },
    });
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.therapistLeave.update({ where: { id: leaveId }, data: { status: client_1.LeaveStatus.APPROVED } });
        yield tx.therapistProfile.update({ where: { id: leave.therapistId }, data: { leavesRemainingThisMonth: { decrement: 1 } } });
        for (const booking of affectedBookings) {
            yield tx.booking.update({ where: { id: booking.id }, data: { status: client_1.BookingStatus.CANCELLED_BY_THERAPIST } });
            yield tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
        }
    }));
    for (const booking of affectedBookings) {
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotificationBookingCancelled({
        //   userId: booking.parent.userId,
        //   message: `Your session for ${booking.timeSlot.startTime.toLocaleDateString()} has been cancelled as the therapist is unavailable.`,
        //   sendAt: new Date(),
        // });
    }
    // Acknowledge therapist
    const therapist = yield prisma_1.default.therapistProfile.findUnique({ where: { id: leave.therapistId } });
    if (therapist) {
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotification({
        //   userId: therapist.userId,
        //   message: `Your leave request for ${startOfDay.toDateString()} has been approved.`,
        //   sendAt: new Date(),
        // });
    }
    return { message: 'Leave approved' };
});
exports.approveLeaveRequest = approveLeaveRequest;
const rejectLeaveRequest = (leaveId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const leave = yield prisma_1.default.therapistLeave.findUnique({ where: { id: leaveId } });
    if (!leave)
        throw new Error('Leave not found');
    yield prisma_1.default.therapistLeave.update({ where: { id: leaveId }, data: { status: client_1.LeaveStatus.REJECTED, reason: reason || leave.reason } });
    const therapist = yield prisma_1.default.therapistProfile.findUnique({ where: { id: leave.therapistId } });
    if (therapist) {
        // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
        // await sendNotification({
        //   userId: therapist.userId,
        //   message: `Your leave request for ${leave.date.toDateString()} was rejected${reason ? `: ${reason}` : ''}.`,
        //   sendAt: new Date(),
        // });
    }
    return { message: 'Leave rejected' };
});
exports.rejectLeaveRequest = rejectLeaveRequest;
