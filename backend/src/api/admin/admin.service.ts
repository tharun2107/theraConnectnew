import { PrismaClient, TherapistStatus, type TherapistStatus as TherapistStatusType, BookingStatus, LeaveStatus } from '@prisma/client';
import { sendNotification, therapistAccountApproved, sendNotificationBookingCancelled } from '../../services/notification.service';
import prisma from '../../utils/prisma';

export const getAllTherapists = async () => {
  // Auto-activate legacy pending therapists since admin-created profiles shouldn't require approval
  await prisma.therapistProfile.updateMany({
    where: { status: TherapistStatus.PENDING_VERIFICATION },
    data: { status: TherapistStatus.ACTIVE },
  });

  return prisma.therapistProfile.findMany({
    include: { user: { select: { email: true, createdAt: true } } },
  });
};

export const updateTherapistStatus = async (therapistId: string, status: TherapistStatusType) => {
  const updatedTherapist = await prisma.therapistProfile.update({
    where: { id: therapistId },
    data: { status },
  });

  if (status === 'ACTIVE') {
    await therapistAccountApproved({
      userId: updatedTherapist.userId,
      message: 'Congratulations! Your profile has been approved by the admin.',
      sendAt: new Date(),
    });
  }

  return updatedTherapist;
};

export const getTherapistSessions = async (therapistId: string) => {
  const sessions = await prisma.booking.findMany({
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
};

export const getAllChildren = async () => {
  const children = await prisma.child.findMany({
    include: {
      parent: { include: { user: true } },
    },
    orderBy: { name: 'asc' },
  });

  return children;
};

export const getChildSessions = async (childId: string) => {
  const sessions = await prisma.booking.findMany({
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
};

export const getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
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
};

export const getProfile = async (userId: string) => {
  const admin = await prisma.adminProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!admin) {
    throw new Error('Admin profile not found');
  }

  return admin;
};

export const updateProfile = async (userId: string, data: any) => {
  const updatedAdmin = await prisma.adminProfile.update({
    where: { userId },
    data: {
      name: data.name,
    },
    include: { user: true },
  });

  return updatedAdmin;
};

export const getPlatformSettings = async () => {
  // For now, return default settings
  // In a real app, you'd store these in a database table
  return {
    id: '1',
    platformName: 'TheraConnect',
    platformEmail: 'admin@theraconnect.com',
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
};

export const updatePlatformSettings = async (data: any) => {
  // For now, just return the updated data
  // In a real app, you'd save these to a database table
  return data;
};

export const listLeaveRequests = async () => {
  return prisma.therapistLeave.findMany({
    where: {},
    include: { therapist: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const approveLeaveRequest = async (leaveId: string) => {
  const leave = await prisma.therapistLeave.findUnique({ where: { id: leaveId } });
  if (!leave) throw new Error('Leave not found');
  if (leave.status === LeaveStatus.APPROVED) return leave;

  const startOfDay = leave.date;
  const endOfDay = new Date(new Date(startOfDay).setUTCHours(23, 59, 59, 999));

  const affectedBookings = await prisma.booking.findMany({
    where: {
      therapistId: leave.therapistId,
      status: 'SCHEDULED',
      timeSlot: { startTime: { gte: startOfDay, lte: endOfDay } },
    },
    include: { parent: { include: { user: true } }, timeSlot: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.therapistLeave.update({ where: { id: leaveId }, data: { status: LeaveStatus.APPROVED } });
    await tx.therapistProfile.update({ where: { id: leave.therapistId }, data: { leavesRemainingThisMonth: { decrement: 1 } } });
    for (const booking of affectedBookings) {
      await tx.booking.update({ where: { id: booking.id }, data: { status: BookingStatus.CANCELLED_BY_THERAPIST } });
      await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
    }
  });

  for (const booking of affectedBookings) {
    await sendNotificationBookingCancelled({
      userId: booking.parent.userId,
      message: `Your session for ${booking.timeSlot.startTime.toLocaleDateString()} has been cancelled as the therapist is unavailable.`,
      sendAt: new Date(),
    });
  }

  // Acknowledge therapist
  const therapist = await prisma.therapistProfile.findUnique({ where: { id: leave.therapistId } });
  if (therapist) {
    await sendNotification({
      userId: therapist.userId,
      message: `Your leave request for ${startOfDay.toDateString()} has been approved.`,
      sendAt: new Date(),
    });
  }

  return { message: 'Leave approved' };
};

export const rejectLeaveRequest = async (leaveId: string, reason?: string) => {
  const leave = await prisma.therapistLeave.findUnique({ where: { id: leaveId } });
  if (!leave) throw new Error('Leave not found');

  await prisma.therapistLeave.update({ where: { id: leaveId }, data: { status: LeaveStatus.REJECTED, reason: reason || leave.reason } });

  const therapist = await prisma.therapistProfile.findUnique({ where: { id: leave.therapistId } });
  if (therapist) {
    await sendNotification({
      userId: therapist.userId,
      message: `Your leave request for ${leave.date.toDateString()} was rejected${reason ? `: ${reason}` : ''}.`,
      sendAt: new Date(),
    });
  }
  return { message: 'Leave rejected' };
};