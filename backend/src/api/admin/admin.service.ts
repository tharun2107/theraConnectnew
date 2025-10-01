import { PrismaClient, type TherapistStatus } from '@prisma/client';
import { sendNotification } from '../../services/notification.service';

const prisma = new PrismaClient();

export const getAllTherapists = async () => {
  return prisma.therapistProfile.findMany({
    include: { user: { select: { email: true, createdAt: true } } },
  });
};

export const updateTherapistStatus = async (therapistId: string, status: TherapistStatus) => {
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