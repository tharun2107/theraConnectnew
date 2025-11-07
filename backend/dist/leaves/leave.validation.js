"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveByIdSchema = exports.getLeaveRequestsSchema = exports.processLeaveSchema = exports.processLeaveBodySchema = exports.processLeaveParamsSchema = exports.requestLeaveSchema = void 0;
const zod_1 = require("zod");
/**
 * Validation schema for requesting leave
 */
exports.requestLeaveSchema = zod_1.z.object({
    body: zod_1.z.object({
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
            message: "Date must be in YYYY-MM-DD format"
        }).refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
            message: "Date cannot be in the past"
        }),
        type: zod_1.z.enum(['CASUAL', 'SICK', 'FESTIVE', 'OPTIONAL'], {
            message: "Invalid leave type"
        }),
        reason: zod_1.z.string().max(500, "Reason cannot exceed 500 characters").optional()
    })
});
/**
 * Validation schema for processing leave params (admin)
 */
exports.processLeaveParamsSchema = zod_1.z.object({
    leaveId: zod_1.z.string().min(1, "Leave ID is required")
});
/**
 * Validation schema for processing leave body (admin)
 */
exports.processLeaveBodySchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT']).describe("Action must be either APPROVE or REJECT"),
    adminNotes: zod_1.z.string().max(500, "Admin notes cannot exceed 500 characters").optional()
});
/**
 * Validation schema for processing leave (admin) - combined for type inference
 */
exports.processLeaveSchema = zod_1.z.object({
    params: exports.processLeaveParamsSchema,
    body: exports.processLeaveBodySchema
});
/**
 * Validation schema for getting leave requests (query params)
 */
exports.getLeaveRequestsSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
    })
});
/**
 * Validation schema for getting leave by ID
 */
exports.getLeaveByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        leaveId: zod_1.z.string().min(1, "Leave ID is required")
    })
});
