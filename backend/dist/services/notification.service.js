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
exports.therapistAccountApproved = exports.sendNotificationBookingConfirmed = exports.sendNotificationAfterAnEventSessionCompleted = exports.sendNotificationBookingCancelled = exports.sendNotification = exports.sendNotificationAfterAnEvent = exports.sendNotificationToTherapistSessionBooked = exports.sendNotificationToTherapist = void 0;
const sendNotificationToTherapist = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationToTherapist = sendNotificationToTherapist;
const sendNotificationToTherapistSessionBooked = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationToTherapistSessionBooked = sendNotificationToTherapistSessionBooked;
const sendNotificationAfterAnEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationAfterAnEvent = sendNotificationAfterAnEvent;
const sendNotification = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotification = sendNotification;
const sendNotificationBookingCancelled = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationBookingCancelled = sendNotificationBookingCancelled;
const sendNotificationAfterAnEventSessionCompleted = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationAfterAnEventSessionCompleted = sendNotificationAfterAnEventSessionCompleted;
const sendNotificationBookingConfirmed = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.sendNotificationBookingConfirmed = sendNotificationBookingConfirmed;
const therapistAccountApproved = (input) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.therapistAccountApproved = therapistAccountApproved;
