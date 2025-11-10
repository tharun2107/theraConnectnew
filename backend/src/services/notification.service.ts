// notification.service.ts
import { PrismaClient } from '@prisma/client';
import { NotificationType } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendemail } from './email.services';



export interface NotificationInput {
  userId: string;
  sendAt: Date;
  message: string;
  welcomeHtml ?:string
}

export const sendNotificationToTherapist = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.SESSION_COMPLETED,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
};

export const sendNotificationToTherapistSessionBooked = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.BOOKING_CONFIRMED,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
};

export const sendNotificationAfterAnEvent = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // const { userId, message, sendAt } = input;
  // const type = NotificationType.REGISTRATION_SUCCESSFUL;
  // await prisma.notification.create({
  //   data:{
  //     userId,
  //     message,
  //     type,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email,'', input.welcomeHtml);
};

export const sendNotification = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.SESSION_REMINDER,
  //     channel: "EMAIL",
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
};

export const sendNotificationBookingCancelled= async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.BOOKING_CANCELLED,
  //     channel: "EMAIL",
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
};


export const sendNotificationAfterAnEventSessionCompleted = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.SESSION_COMPLETED,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
}


export const sendNotificationBookingConfirmed = async (input: NotificationInput) => {
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  //  await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.BOOKING_CONFIRMED,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
}


export const therapistAccountApproved = async(input:NotificationInput)=>{
  // EMAIL FUNCTIONALITY TEMPORARILY DISABLED - COMMENTED OUT FOR FUTURE USE
  // await prisma.notification.create({
  //   data: {
  //     userId: input.userId,
  //     message: input.message,
  //     type: NotificationType.THERAPIST_ACCOUNT_APPROVED,
  //     channel: 'EMAIL',
  //     status: "PENDING",
  //     sendAt: input.sendAt
  //   }
  // });
  // const user = await prisma.user.findUnique({ where: { id: input.userId } });
  // if (!user?.email) {
  //   throw new Error("User email not found");
  // }
  // EMAIL INTEGRATION - COMMENTED OUT FOR FUTURE USE
  // await sendemail(user.email, input.message);
}