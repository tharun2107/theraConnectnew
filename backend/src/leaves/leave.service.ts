import { TherapistLeave, LeaveType, LeaveStatus, NotificationType } from '@prisma/client';
import { startOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';
import { sendemail } from '../services/email.services';
import prisma from '../utils/prisma';

type NotificationPayload = {
  parentUserId: string;
  parentEmail: string | null | undefined;
  therapistName: string;
  sessionTime: Date;
};

export interface LeaveRequestInput {
  date: string; // YYYY-MM-DD
  type: LeaveType;
  reason?: string;
}

export interface LeaveApprovalInput {
  leaveId: string;
  action: 'APPROVE' | 'REJECT';
  adminNotes?: string;
}

export class LeaveService {

  /**
   * Get current leave balances for therapist based on latest approved leave
   */
  private async getLeaveBalances(therapistId: string, leaveDate: Date) {
    // Get the most recent APPROVED leave to get current balances
    const latestLeave = await prisma.therapistLeave.findFirst({
      where: {
        therapistId: therapistId,
        status: LeaveStatus.APPROVED,
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
  }

  /**
   * Check if optional leave has been used this month
   */
  private async hasUsedOptionalThisMonth(therapistId: string, leaveDate: Date): Promise<boolean> {
    // Get the start and end of the current month
    // Use startOfDay to ensure we're comparing dates correctly
    const monthStart = startOfDay(startOfMonth(leaveDate));
    const monthEnd = startOfDay(endOfMonth(leaveDate));

    console.log('[hasUsedOptionalThisMonth] Checking for optional leave:', {
      therapistId,
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      currentDate: leaveDate.toISOString(),
      month: leaveDate.getMonth() + 1,
      year: leaveDate.getFullYear()
    });

    // Query for approved optional leaves in this month
    // Since date field is @db.Date (date-only), Prisma will handle the comparison correctly
    const optionalLeavesThisMonth = await prisma.therapistLeave.findMany({
      where: {
        therapistId: therapistId,
        type: LeaveType.OPTIONAL,
        status: LeaveStatus.APPROVED,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      select: {
        id: true,
        date: true,
        type: true,
        status: true
      }
    });

    console.log('[hasUsedOptionalThisMonth] Found optional leaves this month:', optionalLeavesThisMonth.length);
    if (optionalLeavesThisMonth.length > 0) {
      console.log('[hasUsedOptionalThisMonth] Leave details:', optionalLeavesThisMonth.map(l => ({
        id: l.id,
        date: l.date,
        dateString: l.date.toISOString().split('T')[0],
        type: l.type,
        status: l.status
      })));
    }

    return optionalLeavesThisMonth.length > 0;
  }

  /**
   * Therapist requests leave for a specific date
   */
  async requestLeave(
    therapistUserId: string,
    leaveData: LeaveRequestInput
  ): Promise<TherapistLeave> {
    
    // Get therapist profile
    const therapist = await prisma.user.findUnique({
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
    
    // Parse date string (YYYY-MM-DD) as local date to avoid timezone issues
    // When you do new Date("2025-11-09"), it's interpreted as UTC midnight
    // We need to parse it as local date instead
    const [year, month, day] = leaveData.date.split('-').map(Number);
    const leaveDate = startOfDay(new Date(year, month - 1, day));

    // Validate leave date is in future
    const today = startOfDay(new Date());
    if (leaveDate < today) {
      throw new Error('Cannot request leave for past dates');
    }

    // Check if leave already exists for this date
    const existingLeave = await prisma.therapistLeave.findFirst({
      where: {
        therapistId: therapistProfile.id,
        date: leaveDate,
        status: {
          in: [LeaveStatus.PENDING, LeaveStatus.APPROVED]
        }
      }
    });

    if (existingLeave) {
      throw new Error('Leave request already exists for this date');
    }

    // Get current leave balances
    const balances = await this.getLeaveBalances(therapistProfile.id, leaveDate);

    // Validate leave availability based on type
    switch (leaveData.type) {
      case LeaveType.CASUAL:
        if (!balances.casualRemaining || balances.casualRemaining <= 0) {
          throw new Error('No casual leaves remaining for this year');
        }
        break;
      case LeaveType.SICK:
        if (!balances.sickRemaining || balances.sickRemaining <= 0) {
          throw new Error('No sick leaves remaining for this year');
        }
        break;
      case LeaveType.FESTIVE:
        if (!balances.festiveRemaining || balances.festiveRemaining <= 0) {
          throw new Error('No festive leaves remaining for this year');
        }
        break;
      case LeaveType.OPTIONAL:
        // Check if already used this month
        const hasUsed = await this.hasUsedOptionalThisMonth(therapistProfile.id, leaveDate);
        if (hasUsed) {
          throw new Error('Optional leave already used for this month');
        }
        if (!balances.optionalRemaining || balances.optionalRemaining <= 0) {
          throw new Error('No optional leaves remaining for this month');
        }
        break;
    }

    // Create leave request with current balances
    const leave = await prisma.therapistLeave.create({
      data: {
        therapistId: therapistProfile.id,
        date: leaveDate,
        type: leaveData.type,
        reason: leaveData.reason,
        status: LeaveStatus.PENDING,
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
    await this.notifyAdminAboutLeaveRequest(therapist.email!, therapistProfile.name, leave);

    // Notify therapist
    await this.notifyTherapistLeaveSubmitted(therapist.email!, leave);

    return leave;
  }

  /**
   * Get all leave requests (for admin)
   */
  async getAllLeaveRequests(status?: LeaveStatus): Promise<TherapistLeave[]> {
    
    const whereClause = status ? { status } : {};
    
    console.log('[LeaveService.getAllLeaveRequests] Fetching leaves with where clause:', whereClause);
    
    const leaves = await prisma.therapistLeave.findMany({
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
    
    return leaves as any;
  }

  /**
   * Get leave requests for a specific therapist
   */
  async getTherapistLeaveRequests(therapistUserId: string): Promise<TherapistLeave[]> {
    
    console.log('[LeaveService.getTherapistLeaveRequests] Fetching leaves for therapist userId:', therapistUserId);
    
    const therapist = await prisma.user.findUnique({
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

    const leaves = await prisma.therapistLeave.findMany({
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
  }

  /**
   * Get current leave balances for a therapist
   * Calculates remaining leaves based on actual usage according to leave policy:
   * - Casual: 5 per year
   * - Sick: 5 per year
   * - Festive: 5 per year
   * - Optional: 1 per month
   */
  async getTherapistLeaveBalance(therapistUserId: string) {
    const therapist = await prisma.user.findUnique({
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
    const therapistId = therapist.therapistProfile.id;
    
    // Get current year start and end for annual leaves (Casual, Sick, Festive)
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Get current month start and end for optional leaves
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Count approved leaves in current year for annual leave types
    const [casualCount, sickCount, festiveCount] = await Promise.all([
      // Count approved casual leaves this year
      prisma.therapistLeave.count({
        where: {
          therapistId: therapistId,
          type: LeaveType.CASUAL,
          status: LeaveStatus.APPROVED,
          date: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      }),
      // Count approved sick leaves this year
      prisma.therapistLeave.count({
        where: {
          therapistId: therapistId,
          type: LeaveType.SICK,
          status: LeaveStatus.APPROVED,
          date: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      }),
      // Count approved festive leaves this year
      prisma.therapistLeave.count({
        where: {
          therapistId: therapistId,
          type: LeaveType.FESTIVE,
          status: LeaveStatus.APPROVED,
          date: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      })
    ]);

    // Check if optional leave used this month
    const optionalUsedThisMonth = await this.hasUsedOptionalThisMonth(therapistId, now);

    // Calculate remaining leaves based on leave policy
    // Annual leaves: 5 per year
    const casualRemaining = Math.max(0, 5 - casualCount);
    const sickRemaining = Math.max(0, 5 - sickCount);
    const festiveRemaining = Math.max(0, 5 - festiveCount);
    
    // Optional leaves: 1 per month
    // If one was used this month, remaining is 0, otherwise 1
    const optionalRemaining = optionalUsedThisMonth ? 0 : 1;

    console.log('[getTherapistLeaveBalance] Calculated balances:', {
      casualRemaining,
      sickRemaining,
      festiveRemaining,
      optionalRemaining,
      optionalUsedThisMonth,
      casualCount,
      sickCount,
      festiveCount
    });

    return {
      casualRemaining,
      sickRemaining,
      festiveRemaining,
      optionalRemaining,
      optionalUsedThisMonth
    };
  }

  /**
   * Get single leave request details
   */
  async getLeaveRequestById(leaveId: string): Promise<TherapistLeave> {
    
    const leave = await prisma.therapistLeave.findUnique({
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

    return leave as any;
  }

  /**
   * Admin approves or rejects leave request
   */
  async processLeaveRequest(
    adminUserId: string,
    approvalData: LeaveApprovalInput
  ): Promise<TherapistLeave> {
    
    // No need to verify admin - authorize middleware already ensures:
    // 1. User is authenticated
    // 2. User has ADMIN role
    // 3. User exists in database
    
    // Get leave request
    const leave = await prisma.therapistLeave.findUnique({
      where: { id: approvalData.leaveId },
      include: {
        therapist: {
          include: {
            user: {
              select: { id: true, email: true }
            }
          }
        }
      }
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new Error('Leave request has already been processed');
    }

    const isApproved = approvalData.action === 'APPROVE';

    // --- REJECTION CASE ---
    if (!isApproved) {
      const rejectedLeave = await prisma.therapistLeave.update({
        where: { id: approvalData.leaveId },
        data: { status: LeaveStatus.REJECTED },
        include: {
          therapist: {
            include: {
              user: {
                select: { id: true, email: true }
              }
            }
          }
        }
      });

      await this.notifyTherapistLeaveRejected(
        rejectedLeave.therapist.user.id,
        rejectedLeave.therapist.user.email!,
        rejectedLeave,
        approvalData.adminNotes
      );
      return rejectedLeave as any;
    }

    // --- APPROVAL CASE ---
    let notificationPayloads: NotificationPayload[] = [];
    let updatedLeave: TherapistLeave;
    
    const leaveDate = startOfDay(leave.date);
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
      case LeaveType.CASUAL:
        newBalances.casualRemaining = (newBalances.casualRemaining || 5) - 1;
        break;
      case LeaveType.SICK:
        newBalances.sickRemaining = (newBalances.sickRemaining || 5) - 1;
        break;
      case LeaveType.FESTIVE:
        newBalances.festiveRemaining = (newBalances.festiveRemaining || 5) - 1;
        break;
      case LeaveType.OPTIONAL:
        newBalances.optionalRemaining = (newBalances.optionalRemaining || 1) - 1;
        break;
    }

    try {
      updatedLeave = await prisma.$transaction(async (tx) => {
        
        // 1. Update leave status with new balances
        const updated = await tx.therapistLeave.update({
          where: { id: approvalData.leaveId },
          data: { 
            status: LeaveStatus.APPROVED,
            ...newBalances
          },
          include: { therapist: { include: { user: true } } }
        });

        // 2. Deactivate all therapist's slots for this day
        await tx.timeSlot.updateMany({
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
        const affectedBookings = await tx.booking.findMany({
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
          await tx.booking.updateMany({
            where: { id: { in: bookingIds } },
            data: { status: 'CANCELLED_BY_THERAPIST' }
          });

          // 5. Batch update all affected time slots
          await tx.timeSlot.updateMany({
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

        return updated as any;

      }, {
        timeout: 15000
      });

    } catch (error) {
      console.error('Leave approval transaction failed:', error);
      if (error instanceof Error) {
        throw new Error(`Transaction API error: ${error.message}`);
      }
      throw error;
    }

    // --- POST-TRANSACTION NOTIFICATIONS ---
    const therapist = await prisma.therapistProfile.findFirst({
      where: { id: updatedLeave.therapistId },
      include: { user: true }
    });

    if (!therapist || !therapist.user?.email || !therapist.user?.id) {
      throw new Error("Therapist email or userId not found");
    }
        
    await this.notifyTherapistLeaveApproved(
      therapist.user.id,
      therapist.user.email,
      updatedLeave
    );

    if (notificationPayloads.length > 0) {
      await this.sendParentCancellationNotifications(notificationPayloads);
    }

    return updatedLeave as any;
  }

  /**
   * Send emails and create notifications for affected parents
   */
  private async sendParentCancellationNotifications(
    payloads: NotificationPayload[]
  ): Promise<void> {
    
    const notificationPromises: Promise<any>[] = [];

    for (const payload of payloads) {
      const message = `Your session on ${format(payload.sessionTime, 'MMMM dd, yyyy')} with ${payload.therapistName} has been cancelled due to therapist leave.`;
      
      // Create in-app notification
      notificationPromises.push(
        prisma.notification.create({
          data: {
            userId: payload.parentUserId,
            message: message,
            type: NotificationType.SESSION_CANCELLED_BY_LEAVE,
            channel: 'EMAIL',
            status: 'PENDING',
            sendAt: new Date()
          }
        })
      );

      // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
      // Send email
      // if (payload.parentEmail) {
      //   const emailBody = `Dear Parent,\n\n${message}\n\nPlease book another available slot.\n\nWe apologize for the inconvenience.`;
      //   notificationPromises.push(
      //     sendemail(payload.parentEmail, emailBody)
      //   );
      // }
    }

    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Failed to send one or more cancellation notifications:', error);
    }
  }

  /**
   * Notify admin about new leave request
   */
  private async notifyAdminAboutLeaveRequest(
    therapistEmail: string,
    therapistName: string,
    leave: TherapistLeave
  ): Promise<void> {
    
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New leave request from ${therapistName} for ${format(leave.date, 'MMMM dd, yyyy')} - ${leave.type}`,
          type: NotificationType.LEAVE_REQUEST_SUBMITTED,
          channel: 'EMAIL',
          status: 'PENDING',
          sendAt: new Date()
        }
      });

      // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
      // if (admin.email) {
      //   await sendemail(
      //     admin.email,
      //     `Therapist: ${therapistName}\nDate: ${format(leave.date, 'MMMM dd, yyyy')}\nType: ${leave.type}\nReason: ${leave.reason || 'N/A'}\n\nCurrent Balances:\nCasual: ${leave.casualRemaining}\nSick: ${leave.sickRemaining}\nFestive: ${leave.festiveRemaining}\nOptional: ${leave.optionalRemaining}\n\nPlease review and approve/reject this request in the admin dashboard.`
      //   );
      // }
    }
  }

  /**
   * Notify therapist that leave request was submitted
   */
  private async notifyTherapistLeaveSubmitted(
    therapistEmail: string,
    leave: TherapistLeave
  ): Promise<void> {
    // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
    // await sendemail(
    //   therapistEmail,
    //   `Your leave request for ${format(leave.date, 'MMMM dd, yyyy')} has been submitted successfully.\n\nType: ${leave.type}\nReason: ${leave.reason || 'N/A'}\n\nYou will be notified once the admin reviews your request.`
    // );
  }

  /**
   * Notify therapist that leave was approved
   */
  private async notifyTherapistLeaveApproved(
    therapistUserId: string,
    therapistEmail: string,
    leave: TherapistLeave
  ): Promise<void> {
    const message = `Your leave request for ${format(leave.date, 'MMMM dd, yyyy')} has been approved.\n\nType: ${leave.type}\n\nRemaining Balances:\nCasual: ${leave.casualRemaining}\nSick: ${leave.sickRemaining}\nFestive: ${leave.festiveRemaining}\nOptional: ${leave.optionalRemaining}\n\nAll your sessions for this date have been cancelled and affected parents have been notified.`;
    
    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: therapistUserId,
        message: message,
        type: NotificationType.LEAVE_REQUEST_APPROVED,
        channel: 'EMAIL',
        status: 'PENDING',
        sendAt: new Date()
      }
    });

    // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
    // Send email notification
    // await sendemail(therapistEmail, message);
  }

  /**
   * Notify therapist that leave was rejected
   */
  private async notifyTherapistLeaveRejected(
    therapistUserId: string,
    therapistEmail: string,
    leave: TherapistLeave,
    adminNotes?: string
  ): Promise<void> {
    const message = `Your leave request for ${format(leave.date, 'MMMM dd, yyyy')} has been rejected.\n\nType: ${leave.type}\n${adminNotes ? `\nAdmin Notes: ${adminNotes}` : ''}\n\nPlease contact admin if you have any questions.`;
    
    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: therapistUserId,
        message: message,
        type: NotificationType.LEAVE_REQUEST_REJECTED,
        channel: 'EMAIL',
        status: 'PENDING',
        sendAt: new Date()
      }
    });

    // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
    // Send email notification
    // await sendemail(therapistEmail, message);
  }
}

export const leaveService = new LeaveService();