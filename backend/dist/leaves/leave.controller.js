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
exports.processLeaveHandler = exports.getLeaveDetailsHandler = exports.getAllLeavesHandler = exports.getTherapistLeaveBalanceHandler = exports.getTherapistLeavesHandler = exports.requestLeaveHandler = void 0;
const leave_service_1 = require("./leave.service");
// ============================================
// THERAPIST CONTROLLERS
// ============================================
/**
 * POST /api/therapist/leaves
 * Therapist requests leave for a specific date
 */
const requestLeaveHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const leaveData = req.body;
        const leave = yield leave_service_1.leaveService.requestLeave(userId, leaveData);
        // Format date as YYYY-MM-DD to avoid timezone issues
        // Extract date components directly to avoid timezone conversion
        const dateObj = new Date(leave.date);
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully. Admin will review your request.',
            data: {
                leaveId: leave.id,
                date: formattedDate,
                type: leave.type,
                status: leave.status
            }
        });
    }
    catch (error) {
        console.error('Error requesting leave:', error);
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('Cannot request') || error.message.includes('already exists')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('No leaves remaining')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to submit leave request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.requestLeaveHandler = requestLeaveHandler;
/**
 * GET /api/therapist/leaves
 * Get all leave requests for the therapist
 */
const getTherapistLeavesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        console.log('[LeaveController.getTherapistLeavesHandler] Request received for userId:', userId);
        const leaves = yield leave_service_1.leaveService.getTherapistLeaveRequests(userId);
        console.log('[LeaveController.getTherapistLeavesHandler] Found leaves:', leaves.length);
        console.log('[LeaveController.getTherapistLeavesHandler] Leaves data:', leaves);
        // Format dates as YYYY-MM-DD to avoid timezone issues
        // Extract date components directly to avoid timezone conversion
        const formattedLeaves = leaves.map(leave => {
            const dateObj = new Date(leave.date);
            const year = dateObj.getUTCFullYear();
            const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getUTCDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            return Object.assign(Object.assign({}, leave), { date: formattedDate, createdAt: leave.createdAt });
        });
        return res.status(200).json({
            success: true,
            message: 'Leave requests retrieved successfully',
            data: {
                totalLeaves: formattedLeaves.length,
                leaves: formattedLeaves
            }
        });
    }
    catch (error) {
        console.error('[LeaveController.getTherapistLeavesHandler] Error fetching therapist leaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve leave requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTherapistLeavesHandler = getTherapistLeavesHandler;
/**
 * GET /api/therapist/leaves/balance
 * Get current leave balance for the therapist
 */
const getTherapistLeaveBalanceHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const balance = yield leave_service_1.leaveService.getTherapistLeaveBalance(userId);
        return res.status(200).json({
            success: true,
            message: 'Leave balance retrieved successfully',
            data: balance
        });
    }
    catch (error) {
        console.error('[LeaveController.getTherapistLeaveBalanceHandler] Error fetching leave balance:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve leave balance',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTherapistLeaveBalanceHandler = getTherapistLeaveBalanceHandler;
// ============================================
// ADMIN CONTROLLERS
// ============================================
/**
 * GET /api/admin/leaves
 * Get all leave requests (with optional status filter)
 */
const getAllLeavesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        console.log('[LeaveController.getAllLeavesHandler] Request received:', { status, query: req.query });
        const leaves = yield leave_service_1.leaveService.getAllLeaveRequests(status);
        console.log('[LeaveController.getAllLeavesHandler] Returning leaves:', leaves.length);
        // Format dates as YYYY-MM-DD to avoid timezone issues
        // Extract date components directly to avoid timezone conversion
        const formattedLeaves = leaves.map(leave => {
            const dateObj = new Date(leave.date);
            const year = dateObj.getUTCFullYear();
            const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getUTCDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            return Object.assign(Object.assign({}, leave), { date: formattedDate, createdAt: leave.createdAt });
        });
        return res.status(200).json({
            success: true,
            message: 'Leave requests retrieved successfully',
            data: {
                totalLeaves: formattedLeaves.length,
                leaves: formattedLeaves
            }
        });
    }
    catch (error) {
        console.error('[LeaveController.getAllLeavesHandler] Error fetching all leaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve leave requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getAllLeavesHandler = getAllLeavesHandler;
/**
 * GET /api/admin/leaves/:leaveId
 * Get details of a specific leave request
 */
const getLeaveDetailsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leaveId } = req.params;
        const leave = yield leave_service_1.leaveService.getLeaveRequestById(leaveId);
        return res.status(200).json({
            success: true,
            message: 'Leave request details retrieved successfully',
            data: leave
        });
    }
    catch (error) {
        console.error('Error fetching leave details:', error);
        if (error instanceof Error && error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve leave details',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getLeaveDetailsHandler = getLeaveDetailsHandler;
/**
 * PUT /api/admin/leaves/:leaveId
 * Approve or reject a leave request
 */
const processLeaveHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[processLeaveHandler] Request received:', {
            params: req.params,
            body: req.body,
            userId: req.user.userId
        });
        const userId = req.user.userId;
        const { leaveId } = req.params;
        const approvalData = {
            leaveId: leaveId,
            action: req.body.action,
            adminNotes: req.body.adminNotes
        };
        console.log('[processLeaveHandler] Approval data:', approvalData);
        const leave = yield leave_service_1.leaveService.processLeaveRequest(userId, approvalData);
        const isApproved = approvalData.action === 'APPROVE';
        return res.status(200).json({
            success: true,
            message: isApproved
                ? 'Leave request approved successfully. Therapist and affected parents have been notified.'
                : 'Leave request rejected. Therapist has been notified.',
            data: {
                leaveId: leave.id,
                status: leave.status,
                date: leave.date,
                type: leave.type
            }
        });
    }
    catch (error) {
        console.error('[processLeaveHandler] Error processing leave:', error);
        if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('Admin user not found')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('already been processed')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('not an admin')) {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to process leave request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.processLeaveHandler = processLeaveHandler;
