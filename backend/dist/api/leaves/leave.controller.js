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
exports.processLeaveHandler = exports.getLeaveDetailsHandler = exports.getAllLeavesHandler = exports.getTherapistLeavesHandler = exports.requestLeaveHandler = void 0;
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
        const userId = req.currentUser.userId;
        const leaveData = req.body;
        const leave = yield leave_service_1.leaveService.requestLeave(userId, leaveData);
        return res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully. Admin will review your request.',
            data: {
                leaveId: leave.id,
                date: leave.date,
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
        const userId = req.currentUser.userId;
        const leaves = yield leave_service_1.leaveService.getTherapistLeaveRequests(userId);
        return res.status(200).json({
            success: true,
            message: 'Leave requests retrieved successfully',
            data: {
                totalLeaves: leaves.length,
                leaves: leaves
            }
        });
    }
    catch (error) {
        console.error('Error fetching therapist leaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve leave requests',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTherapistLeavesHandler = getTherapistLeavesHandler;
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
        const leaves = yield leave_service_1.leaveService.getAllLeaveRequests(status);
        return res.status(200).json({
            success: true,
            message: 'Leave requests retrieved successfully',
            data: {
                totalLeaves: leaves.length,
                leaves: leaves
            }
        });
    }
    catch (error) {
        console.error('Error fetching all leaves:', error);
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
        const userId = req.currentUser.userId;
        const approvalData = Object.assign({ leaveId: req.body.leaveId }, req.body);
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
        console.error('Error processing leave:', error);
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
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
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to process leave request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.processLeaveHandler = processLeaveHandler;
