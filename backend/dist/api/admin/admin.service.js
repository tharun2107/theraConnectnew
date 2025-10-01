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
exports.updateTherapistStatus = exports.getAllTherapists = void 0;
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../services/notification.service");
const prisma = new client_1.PrismaClient();
const getAllTherapists = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.therapistProfile.findMany({
        include: { user: { select: { email: true, createdAt: true } } },
    });
});
exports.getAllTherapists = getAllTherapists;
const updateTherapistStatus = (therapistId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedTherapist = yield prisma.therapistProfile.update({
        where: { id: therapistId },
        data: { status },
    });
    if (status === 'ACTIVE') {
        yield (0, notification_service_1.sendNotification)({
            userId: updatedTherapist.userId,
            type: 'THERAPIST_ACCOUNT_APPROVED',
            message: 'Congratulations! Your profile has been approved by the admin.',
        });
    }
    return updatedTherapist;
});
exports.updateTherapistStatus = updateTherapistStatus;
