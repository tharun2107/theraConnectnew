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
exports.sendEmail = exports.sendNotification = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const sendNotification = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.create({
        data: {
            userId: input.userId,
            message: input.message,
            type: input.type,
        },
    });
    // In a real app, you would add an email/push notification service call here
    console.log(`NOTIFICATION for ${input.userId}: ${input.message}`);
});
exports.sendNotification = sendNotification;
const sendEmail = (input) => __awaiter(void 0, void 0, void 0, function* () {
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Mailgun
    // - etc.
    console.log('EMAIL SENT:', {
        to: input.to,
        subject: input.subject,
        html: input.html,
    });
    // For now, we'll just log the email content
    // In production, replace this with actual email service integration
    return Promise.resolve();
});
exports.sendEmail = sendEmail;
