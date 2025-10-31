"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getActiveTherapistsHandler = exports.deleteChildHandler = exports.updateChildHandler = exports.addChildHandler = exports.getMyChildrenHandler = exports.updateMyProfileHandler = exports.getMyProfileHandler = void 0;
const parentService = __importStar(require("./parent.service"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getParentId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const parentProfile = yield prisma_1.default.parentProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!parentProfile)
        throw new Error('Parent profile not found');
    return parentProfile.id;
});
const getMyProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield parentService.getParentProfile(req.user.userId);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getMyProfileHandler = getMyProfileHandler;
const updateMyProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        console.log('[PARENT][UPDATE_PROFILE]', userId, req.body);
        const updated = yield parentService.updateParentProfile(userId, req.body);
        res.status(200).json(updated);
    }
    catch (error) {
        console.error('[PARENT][UPDATE_PROFILE][ERROR]', (error === null || error === void 0 ? void 0 : error.message) || error);
        const status = /unique|constraint/i.test(error === null || error === void 0 ? void 0 : error.message) ? 409 : 500;
        res.status(status).json({ message: error.message || 'Failed to update profile' });
    }
});
exports.updateMyProfileHandler = updateMyProfileHandler;
const getMyChildrenHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentId = yield getParentId(req.user.userId);
        const children = yield parentService.getChildren(parentId);
        res.status(200).json(children);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getMyChildrenHandler = getMyChildrenHandler;
const addChildHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parentId = yield getParentId(req.user.userId);
        const child = yield parentService.addChild(parentId, req.body);
        res.status(201).json(child);
    }
    catch (error) {
        // Check for Prisma unique constraint error
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(400).json({
                    message: 'Duplicate child detected. You cannot add the same child twice.',
                    fields: (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target, // optional: shows which field caused the violation
                });
            }
        }
        // fallback for other errors
        res.status(500).json({ message: 'Failed to add child' });
    }
});
exports.addChildHandler = addChildHandler;
const updateChildHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentId = yield getParentId(req.user.userId);
        const { childId } = req.params;
        const child = yield parentService.updateChild(childId, parentId, req.body);
        res.status(200).json(child);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update child' });
    }
});
exports.updateChildHandler = updateChildHandler;
const deleteChildHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parentId = yield getParentId(req.user.userId);
        const { childId } = req.params;
        yield parentService.deleteChild(childId, parentId);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete child' });
    }
});
exports.deleteChildHandler = deleteChildHandler;
const getActiveTherapistsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapists = yield parentService.listActiveTherapists();
        res.status(200).json(therapists);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve active therapists' });
    }
});
exports.getActiveTherapistsHandler = getActiveTherapistsHandler;
