import { z } from 'zod';
import { LeaveType, LeaveStatus } from '@prisma/client';

/**
 * Validation schema for requesting leave
 */
export const requestLeaveSchema = z.object({
body : z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format"
  }).refine(
    (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Date cannot be in the past"
    }
  ),
  type: z.enum(['CASUAL', 'SICK', 'FESTIVE', 'OPTIONAL'], {
    message: "Invalid leave type"
  }),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional()
})
});

/**
 * Validation schema for processing leave params (admin)
 */
export const processLeaveParamsSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required")
});

/**
 * Validation schema for processing leave body (admin)
 */
export const processLeaveBodySchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']).describe("Action must be either APPROVE or REJECT"),
  adminNotes: z.string().max(500, "Admin notes cannot exceed 500 characters").optional()
});

/**
 * Validation schema for processing leave (admin) - combined for type inference
 */
export const processLeaveSchema = z.object({
   params: processLeaveParamsSchema,
   body: processLeaveBodySchema
});

/**
 * Validation schema for getting leave requests (query params)
 */
export const getLeaveRequestsSchema = z.object({
   query : z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional()
   })
});

/**
 * Validation schema for getting leave by ID
 */
export const getLeaveByIdSchema = z.object({
    params : z.object({
         leaveId: z.string().min(1, "Leave ID is required")
    })
});

export type RequestLeaveInput = z.infer<typeof requestLeaveSchema>['body'];
export type ProcessLeaveInput = z.infer<typeof processLeaveSchema>['body'];
export type GetLeaveRequestsInput = z.infer<typeof getLeaveRequestsSchema>['query'];
export type GetLeaveByIdInput = z.infer<typeof getLeaveByIdSchema>['params'];
