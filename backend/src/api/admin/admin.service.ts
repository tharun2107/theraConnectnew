import { PrismaClient, TherapistStatus, type TherapistStatus as TherapistStatusType } from '@prisma/client';
import { sendNotification, therapistAccountApproved } from '../../services/notification.service';
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