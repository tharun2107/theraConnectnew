import { PrismaClient, type NotificationType } from '@prisma/client';
const prisma = new PrismaClient();

export interface NotificationInput {
  userId: string;
  message: string;
  type: NotificationType;
}

export const sendNotification = async (input: NotificationInput) => {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      message: input.message,
      type: input.type,
    },
  });
  // In a real app, you would add an email/push notification service call here
  console.log(`NOTIFICATION for ${input.userId}: ${input.message}`);
};