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
exports.listActiveTherapists = exports.deleteChild = exports.updateChild = exports.addChild = exports.getChildren = exports.updateParentProfile = exports.getParentProfile = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getParentProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.parentProfile.findUnique({ where: { userId } });
});
exports.getParentProfile = getParentProfile;
const updateParentProfile = (userId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.parentProfile.update({
        where: { userId },
        data: input,
    });
});
exports.updateParentProfile = updateParentProfile;
const getChildren = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.child.findMany({ where: { parentId } });
});
exports.getChildren = getChildren;
const addChild = (parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.child.create({
        data: Object.assign(Object.assign({}, input), { parentId }),
    });
});
exports.addChild = addChild;
const updateChild = (childId, parentId, input) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.child.update({
        where: { id: childId, parentId }, // Ensures a parent can only update their own child
        data: input,
    });
});
exports.updateChild = updateChild;
const deleteChild = (childId, parentId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.child.delete({
        where: { id: childId, parentId },
    });
});
exports.deleteChild = deleteChild;
const listActiveTherapists = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.therapistProfile.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            name: true,
            specialization: true,
            experience: true,
            baseCostPerSession: true,
            averageRating: true,
            availableSlotTimes: true, // Include available slot times for booking
        },
        orderBy: { name: 'asc' },
    });
});
exports.listActiveTherapists = listActiveTherapists;
