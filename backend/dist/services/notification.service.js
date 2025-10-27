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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.therapistAccountApproved = exports.sendNotificationBookingConfirmed = exports.sendNotificationAfterAnEventSessionCompleted = exports.sendNotificationBookingCancelled = exports.sendNotification = exports.sendNotificationAfterAnEvent = exports.sendNotificationToTherapistSessionBooked = exports.sendNotificationToTherapist = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const email_services_1 = require("./email.services");
const sendNotificationToTherapist = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.SESSION_COMPLETED,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotificationToTherapist = sendNotificationToTherapist;
const sendNotificationToTherapistSessionBooked = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.BOOKING_CONFIRMED,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotificationToTherapistSessionBooked = sendNotificationToTherapistSessionBooked;
const sendNotificationAfterAnEvent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, message, sendAt } = input;
    const type = client_1.NotificationType.REGISTRATION_SUCCESSFUL;
    yield prisma_1.default.notification.create({
        data: {
            userId,
            message,
            type,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, '', input.welcomeHtml);
});
exports.sendNotificationAfterAnEvent = sendNotificationAfterAnEvent;
const sendNotification = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.SESSION_REMINDER,
            channel: "EMAIL",
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotification = sendNotification;
const sendNotificationBookingCancelled = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.BOOKING_CANCELLED,
            channel: "EMAIL",
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotificationBookingCancelled = sendNotificationBookingCancelled;
const sendNotificationAfterAnEventSessionCompleted = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.SESSION_COMPLETED,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotificationAfterAnEventSessionCompleted = sendNotificationAfterAnEventSessionCompleted;
const sendNotificationBookingConfirmed = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.BOOKING_CONFIRMED,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.sendNotificationBookingConfirmed = sendNotificationBookingConfirmed;
const therapistAccountApproved = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: client_1.NotificationType.THERAPIST_ACCOUNT_APPROVED,
            channel: 'EMAIL',
            status: "PENDING",
            sendAt: input.sendAt
        }
    });
    const user = yield prisma_1.default.user.findUnique({ where: { id: input.userId } });
    if (!(user === null || user === void 0 ? void 0 : user.email)) {
        throw new Error("User email not found");
    }
    yield (0, email_services_1.sendemail)(user.email, input.message);
});
exports.therapistAccountApproved = therapistAccountApproved;
