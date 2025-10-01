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
exports.sendNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const sendNotification = (input) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.notification.create({
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
