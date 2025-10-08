import { PrismaClient, TherapistStatus, type TherapistStatus as TherapistStatusType } from '@prisma/client';
import { sendNotification } from '../../services/notification.service';

const prisma = new PrismaClient();

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
    await sendNotification({
      userId: updatedTherapist.userId,
      type: 'THERAPIST_ACCOUNT_APPROVED',
      message: 'Congratulations! Your profile has been approved by the admin.',
    });
  }

  return updatedTherapist;
};