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
exports.leaveService = exports.LeaveService = void 0;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const email_services_1 = require("../services/email.services");
const prisma_1 = __importDefault(require("../utils/prisma"));
class LeaveService {
    /**
     * Get current leave balances for therapist based on latest approved leave
     */
    getLeaveBalances(therapistId, leaveDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the most recent APPROVED leave to get current balances
            const latestLeave = yield prisma_1.default.therapistLeave.findFirst({
                where: {
                    therapistId: therapistId,
                    status: client_1.LeaveStatus.APPROVED,
                    date: {
                        lte: leaveDate
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });
            // If no previous leave, return default values
            if (!latestLeave) {
                return {
                    casualRemaining: 5,
                    sickRemaining: 5,
                    festiveRemaining: 5,
                    optionalRemaining: 1
                };
            }
            return {
                casualRemaining: latestLeave.casualRemaining,
                sickRemaining: latestLeave.sickRemaining,
                festiveRemaining: latestLeave.festiveRemaining,
                optionalRemaining: latestLeave.optionalRemaining
            };
        });
    }
    /**
     * Check if optional leave has been used this month
     */
    hasUsedOptionalThisMonth(therapistId, leaveDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const monthStart = (0, date_fns_1.startOfMonth)(leaveDate);
            const monthEnd = (0, date_fns_1.endOfMonth)(leaveDate);
            const optionalLeaveThisMonth = yield prisma_1.default.therapistLeave.findFirst({
                where: {
                    therapistId: therapistId,
                    type: client_1.LeaveType.OPTIONAL,
                    status: client_1.LeaveStatus.APPROVED,
                    date: {
                        gte: monthStart,
                        lte: monthEnd
                    }
                }
            });
            return !!optionalLeaveThisMonth;
        });
    }
    /**
     * Therapist requests leave for a specific date
     */
    requestLeave(therapistUserId, leaveData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get therapist profile
            const therapist = yield prisma_1.default.user.findUnique({
                where: { id: therapistUserId },
                include: {
                    therapistProfile: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            if (!therapist || !therapist.therapistProfile) {
                throw new Error('Therapist profile not found');
            }
            const therapistProfile = therapist.therapistProfile;
            const leaveDate = (0, date_fns_1.startOfDay)(new Date(leaveData.date));
            // Validate leave date is in future
            if (leaveDate < (0, date_fns_1.startOfDay)(new Date())) {
                throw new Error('Cannot request leave for past dates');
            }
            // Check if leave already exists for this date
            const existingLeave = yield prisma_1.default.therapistLeave.findFirst({
                where: {
                    therapistId: therapistProfile.id,
                    date: leaveDate,
                    status: {
                        in: [client_1.LeaveStatus.PENDING, client_1.LeaveStatus.APPROVED]
                    }
                }
            });
            if (existingLeave) {
                throw new Error('Leave request already exists for this date');
            }
            // Get current leave balances
            const balances = yield this.getLeaveBalances(therapistProfile.id, leaveDate);
            // Validate leave availability based on type
            switch (leaveData.type) {
                case client_1.LeaveType.CASUAL:
                    if (!balances.casualRemaining || balances.casualRemaining <= 0) {
                        throw new Error('No casual leaves remaining for this year');
                    }
                    break;
                case client_1.LeaveType.SICK:
                    if (!balances.sickRemaining || balances.sickRemaining <= 0) {
                        throw new Error('No sick leaves remaining for this year');
                    }
                    break;
                case client_1.LeaveType.FESTIVE:
                    if (!balances.festiveRemaining || balances.festiveRemaining <= 0) {
                        throw new Error('No festive leaves remaining for this year');
                    }
                    break;
                case client_1.LeaveType.OPTIONAL:
                    // Check if already used this month
                    const hasUsed = yield this.hasUsedOptionalThisMonth(therapistProfile.id, leaveDate);
                    if (hasUsed) {
                        throw new Error('Optional leave already used for this month');
                    }
                    if (!balances.optionalRemaining || balances.optionalRemaining <= 0) {
                        throw new Error('No optional leaves remaining for this month');
                    }
                    break;
            }
            // Create leave request with current balances
            const leave = yield prisma_1.default.therapistLeave.create({
                data: {
                    therapistId: therapistProfile.id,
                    date: leaveDate,
                    type: leaveData.type,
                    reason: leaveData.reason,
                    status: client_1.LeaveStatus.PENDING,
                    casualRemaining: balances.casualRemaining,
                    sickRemaining: balances.sickRemaining,
                    festiveRemaining: balances.festiveRemaining,
                    optionalRemaining: balances.optionalRemaining
                }
            });
            console.log('[LeaveService.requestLeave] Leave created successfully:', {
                id: leave.id,
                therapistId: leave.therapistId,
                date: leave.date,
                type: leave.type,
                status: leave.status
            });
            // Notify admin about leave request
            yield this.notifyAdminAboutLeaveRequest(therapist.email, therapistProfile.name, leave);
            // Notify therapist
            yield this.notifyTherapistLeaveSubmitted(therapist.email, leave);
            return leave;
        });
    }
    /**
     * Get all leave requests (for admin)
     */
    getAllLeaveRequests(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = status ? { status } : {};
            console.log('[LeaveService.getAllLeaveRequests] Fetching leaves with where clause:', whereClause);
            const leaves = yield prisma_1.default.therapistLeave.findMany({
                where: whereClause,
                include: {
                    therapist: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            specialization: true,
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            console.log('[LeaveService.getAllLeaveRequests] Found leaves:', leaves.length);
            return leaves;
        });
    }
    /**
     * Get leave requests for a specific therapist
     */
    getTherapistLeaveRequests(therapistUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[LeaveService.getTherapistLeaveRequests] Fetching leaves for therapist userId:', therapistUserId);
            const therapist = yield prisma_1.default.user.findUnique({
                where: { id: therapistUserId },
                select: {
                    therapistProfile: {
                        select: { id: true }
                    }
                }
            });
            console.log('[LeaveService.getTherapistLeaveRequests] Therapist found:', therapist);
            if (!therapist || !therapist.therapistProfile) {
                console.error('[LeaveService.getTherapistLeaveRequests] Therapist profile not found');
                throw new Error('Therapist profile not found');
            }
            console.log('[LeaveService.getTherapistLeaveRequests] Therapist profile ID:', therapist.therapistProfile.id);
            const leaves = yield prisma_1.default.therapistLeave.findMany({
                where: {
                    therapistId: therapist.therapistProfile.id
                },
                orderBy: {
                    date: 'desc'
                }
            });
            console.log('[LeaveService.getTherapistLeaveRequests] Found leaves:', leaves.length);
            console.log('[LeaveService.getTherapistLeaveRequests] Leaves data:', leaves);
            return leaves;
        });
    }
    /**
     * Get current leave balances for a therapist
     */
    getTherapistLeaveBalance(therapistUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const therapist = yield prisma_1.default.user.findUnique({
                where: { id: therapistUserId },
                select: {
                    therapistProfile: {
                        select: { id: true }
                    }
                }
            });
            if (!therapist || !therapist.therapistProfile) {
                throw new Error('Therapist profile not found');
            }
            const now = new Date();
            const balances = yield this.getLeaveBalances(therapist.therapistProfile.id, now);
            // Check if optional leave used this month
            const optionalUsedThisMonth = yield this.hasUsedOptionalThisMonth(therapist.therapistProfile.id, now);
            return Object.assign(Object.assign({}, balances), { optionalUsedThisMonth });
        });
    }
    /**
     * Get single leave request details
     */
    getLeaveRequestById(leaveId) {
        return __awaiter(this, void 0, void 0, function* () {
            const leave = yield prisma_1.default.therapistLeave.findUnique({
                where: { id: leaveId },
                include: {
                    therapist: {
                        select: {
                            name: true,
                            phone: true,
                            specialization: true,
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            if (!leave) {
                throw new Error('Leave request not found');
            }
            return leave;
        });
    }
    /**
     * Admin approves or rejects leave request
     */
    processLeaveRequest(adminUserId, approvalData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Verify admin
            const admin = yield prisma_1.default.user.findUnique({
                where: { id: adminUserId },
                include: { adminProfile: true }
            });
            if (!admin || !admin.adminProfile) {
                throw new Error('Admin profile not found');
            }
            // Get leave request
            const leave = yield prisma_1.default.therapistLeave.findUnique({
                where: { id: approvalData.leaveId },
                include: {
                    therapist: {
                        include: {
                            user: {
                                select: { email: true }
                            }
                        }
                    }
                }
            });
            if (!leave) {
                throw new Error('Leave request not found');
            }
            if (leave.status !== client_1.LeaveStatus.PENDING) {
                throw new Error('Leave request has already been processed');
            }
            const isApproved = approvalData.action === 'APPROVE';
            // --- REJECTION CASE ---
            if (!isApproved) {
                const rejectedLeave = yield prisma_1.default.therapistLeave.update({
                    where: { id: approvalData.leaveId },
                    data: { status: client_1.LeaveStatus.REJECTED }
                });
                yield this.notifyTherapistLeaveRejected(leave.therapist.user.email, rejectedLeave, approvalData.adminNotes);
                return rejectedLeave;
            }
            // --- APPROVAL CASE ---
            let notificationPayloads = [];
            let updatedLeave;
            const leaveDate = (0, date_fns_1.startOfDay)(leave.date);
            const endOfLeaveDate = new Date(leaveDate);
            endOfLeaveDate.setHours(23, 59, 59, 999);
            // Calculate new balances after deduction
            const newBalances = {
                casualRemaining: leave.casualRemaining,
                sickRemaining: leave.sickRemaining,
                festiveRemaining: leave.festiveRemaining,
                optionalRemaining: leave.optionalRemaining
            };
            // Deduct based on leave type
            switch (leave.type) {
                case client_1.LeaveType.CASUAL:
                    newBalances.casualRemaining = (newBalances.casualRemaining || 5) - 1;
                    break;
                case client_1.LeaveType.SICK:
                    newBalances.sickRemaining = (newBalances.sickRemaining || 5) - 1;
                    break;
                case client_1.LeaveType.FESTIVE:
                    newBalances.festiveRemaining = (newBalances.festiveRemaining || 5) - 1;
                    break;
                case client_1.LeaveType.OPTIONAL:
                    newBalances.optionalRemaining = (newBalances.optionalRemaining || 1) - 1;
                    break;
            }
            try {
                updatedLeave = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // 1. Update leave status with new balances
                    const updated = yield tx.therapistLeave.update({
                        where: { id: approvalData.leaveId },
                        data: Object.assign({ status: client_1.LeaveStatus.APPROVED }, newBalances),
                        include: { therapist: { include: { user: true } } }
                    });
                    // 2. Deactivate all therapist's slots for this day
                    yield tx.timeSlot.updateMany({
                        where: {
                            therapistId: leave.therapistId,
                            startTime: {
                                gte: leaveDate,
                                lte: endOfLeaveDate
                            }
                        },
                        data: { isActive: false }
                    });
                    // 3. Find all scheduled bookings to be cancelled
                    const affectedBookings = yield tx.booking.findMany({
                        where: {
                            therapistId: leave.therapistId,
                            status: 'SCHEDULED',
                            timeSlot: {
                                startTime: {
                                    gte: leaveDate,
                                    lte: endOfLeaveDate
                                }
                            }
                        },
                        include: {
                            parent: { include: { user: { select: { id: true, email: true } } } },
                            therapist: { select: { name: true } },
                            timeSlot: true
                        }
                    });
                    if (affectedBookings.length > 0) {
                        const bookingIds = affectedBookings.map(b => b.id);
                        const timeSlotIds = affectedBookings.map(b => b.timeSlotId);
                        // 4. Batch update all affected bookings to CANCELLED
                        yield tx.booking.updateMany({
                            where: { id: { in: bookingIds } },
                            data: { status: 'CANCELLED_BY_THERAPIST' }
                        });
                        // 5. Batch update all affected time slots
                        yield tx.timeSlot.updateMany({
                            where: { id: { in: timeSlotIds } },
                            data: { isBooked: false }
                        });
                        // 6. Prepare notification payloads
                        notificationPayloads = affectedBookings.map(b => ({
                            parentUserId: b.parent.user.id,
                            parentEmail: b.parent.user.email,
                            therapistName: b.therapist.name,
                            sessionTime: b.timeSlot.startTime
                        }));
                    }
                    return updated;
                }), {
                    timeout: 15000
                });
            }
            catch (error) {
                console.error('Leave approval transaction failed:', error);
                if (error instanceof Error) {
                    throw new Error(`Transaction API error: ${error.message}`);
                }
                throw error;
            }
            // --- POST-TRANSACTION NOTIFICATIONS ---
            const therapist = yield prisma_1.default.therapistProfile.findFirst({
                where: { id: updatedLeave.therapistId },
                include: { user: true }
            });
            if (!therapist || !((_a = therapist.user) === null || _a === void 0 ? void 0 : _a.email)) {
                throw new Error("Therapist email not found");
            }
            yield this.notifyTherapistLeaveApproved(therapist.user.email, updatedLeave);
            if (notificationPayloads.length > 0) {
                yield this.sendParentCancellationNotifications(notificationPayloads);
            }
            return updatedLeave;
        });
    }
    /**
     * Send emails and create notifications for affected parents
     */
    sendParentCancellationNotifications(payloads) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPromises = [];
            for (const payload of payloads) {
                const message = `Your session on ${(0, date_fns_1.format)(payload.sessionTime, 'MMMM dd, yyyy')} with ${payload.therapistName} has been cancelled due to therapist leave.`;
                // Create in-app notification
                notificationPromises.push(prisma_1.default.notification.create({
                    data: {
                        userId: payload.parentUserId,
                        message: message,
                        type: client_1.NotificationType.SESSION_CANCELLED_BY_LEAVE,
                        channel: 'EMAIL',
                        status: 'PENDING',
                        sendAt: new Date()
                    }
                }));
                // Send email
                if (payload.parentEmail) {
                    const emailBody = `Dear Parent,\n\n${message}\n\nPlease book another available slot.\n\nWe apologize for the inconvenience.`;
                    notificationPromises.push((0, email_services_1.sendemail)(payload.parentEmail, emailBody));
                }
            }
            try {
                yield Promise.all(notificationPromises);
            }
            catch (error) {
                console.error('Failed to send one or more cancellation notifications:', error);
            }
        });
    }
    /**
     * Notify admin about new leave request
     */
    notifyAdminAboutLeaveRequest(therapistEmail, therapistName, leave) {
        return __awaiter(this, void 0, void 0, function* () {
            const admins = yield prisma_1.default.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true, email: true }
            });
            for (const admin of admins) {
                yield prisma_1.default.notification.create({
                    data: {
                        userId: admin.id,
                        message: `New leave request from ${therapistName} for ${(0, date_fns_1.format)(leave.date, 'MMMM dd, yyyy')} - ${leave.type}`,
                        type: client_1.NotificationType.LEAVE_REQUEST_SUBMITTED,
                        channel: 'EMAIL',
                        status: 'PENDING',
                        sendAt: new Date()
                    }
                });
                if (admin.email) {
                    yield (0, email_services_1.sendemail)(admin.email, `Therapist: ${therapistName}\nDate: ${(0, date_fns_1.format)(leave.date, 'MMMM dd, yyyy')}\nType: ${leave.type}\nReason: ${leave.reason || 'N/A'}\n\nCurrent Balances:\nCasual: ${leave.casualRemaining}\nSick: ${leave.sickRemaining}\nFestive: ${leave.festiveRemaining}\nOptional: ${leave.optionalRemaining}\n\nPlease review and approve/reject this request in the admin dashboard.`);
                }
            }
        });
    }
    /**
     * Notify therapist that leave request was submitted
     */
    notifyTherapistLeaveSubmitted(therapistEmail, leave) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, email_services_1.sendemail)(therapistEmail, `Your leave request for ${(0, date_fns_1.format)(leave.date, 'MMMM dd, yyyy')} has been submitted successfully.\n\nType: ${leave.type}\nReason: ${leave.reason || 'N/A'}\n\nYou will be notified once the admin reviews your request.`);
        });
    }
    /**
     * Notify therapist that leave was approved
     */
    notifyTherapistLeaveApproved(therapistEmail, leave) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, email_services_1.sendemail)(therapistEmail, `Your leave request for ${(0, date_fns_1.format)(leave.date, 'MMMM dd, yyyy')} has been approved.\n\nType: ${leave.type}\n\nRemaining Balances:\nCasual: ${leave.casualRemaining}\nSick: ${leave.sickRemaining}\nFestive: ${leave.festiveRemaining}\nOptional: ${leave.optionalRemaining}\n\nAll your sessions for this date have been cancelled and affected parents have been notified.`);
        });
    }
    /**
     * Notify therapist that leave was rejected
     */
    notifyTherapistLeaveRejected(therapistEmail, leave, adminNotes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, email_services_1.sendemail)(therapistEmail, `Your leave request for ${(0, date_fns_1.format)(leave.date, 'MMMM dd, yyyy')} has been rejected.\n\nType: ${leave.type}\n${adminNotes ? `\nAdmin Notes: ${adminNotes}` : ''}\n\nPlease contact admin if you have any questions.`);
        });
    }
}
exports.LeaveService = LeaveService;
exports.leaveService = new LeaveService();
