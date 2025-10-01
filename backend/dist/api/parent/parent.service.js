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
exports.listActiveTherapists = exports.deleteChild = exports.updateChild = exports.addChild = exports.getChildren = exports.getParentProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getParentProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.parentProfile.findUnique({ where: { userId } });
});
exports.getParentProfile = getParentProfile;
const getChildren = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.child.findMany({ where: { parentId } });
});
exports.getChildren = getChildren;
const addChild = (parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.child.create({
        data: Object.assign(Object.assign({}, input), { parentId }),
    });
});
exports.addChild = addChild;
const updateChild = (childId, parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.child.update({
        where: { id: childId, parentId }, // Ensures a parent can only update their own child
        data: input,
    });
});
exports.updateChild = updateChild;
const deleteChild = (childId, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.child.delete({
        where: { id: childId, parentId },
    });
});
exports.deleteChild = deleteChild;
const listActiveTherapists = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.therapistProfile.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            specialization: true,
            experience: true,
            baseCostPerSession: true,
            averageRating: true,
        },
        orderBy: { name: 'asc' },
    });
});
exports.listActiveTherapists = listActiveTherapists;
