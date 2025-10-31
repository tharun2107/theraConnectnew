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
exports.setAvailableSlotTimesHandler = exports.checkHasActiveSlotsHandler = exports.getMySlotsForDateHandler = exports.requestLeaveHandler = exports.createTimeSlotsHandler = exports.getMyProfileHandler = void 0;
const therapistService = __importStar(require("./therapist.service"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getTherapistId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.therapistProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile)
        throw new Error('Therapist profile not found');
    return profile.id;
});
const getMyProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield therapistService.getTherapistProfile(req.user.userId);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getMyProfileHandler = getMyProfileHandler;
const createTimeSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapistId = yield getTherapistId(req.user.userId);
        console.log('[createTimeSlots] therapistId=', therapistId, 'body=', req.body);
        const result = yield therapistService.createTimeSlots(therapistId, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('[createTimeSlots][ERROR]', error);
        res.status(500).json({ message: error.message });
    }
});
exports.createTimeSlotsHandler = createTimeSlotsHandler;
const requestLeaveHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapistId = yield getTherapistId(req.user.userId);
        const result = yield therapistService.requestLeave(therapistId, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.requestLeaveHandler = requestLeaveHandler;
const getMySlotsForDateHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const therapistId = yield getTherapistId(req.user.userId);
        const date = ((_d = (_c = (_b = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.validated) === null || _b === void 0 ? void 0 : _b.query) === null || _c === void 0 ? void 0 : _c.date) !== null && _d !== void 0 ? _d : req.query.date);
        console.log('[getMySlotsForDate] therapistId=', therapistId, 'date=', date);
        const slots = yield therapistService.getMySlotsForDate(therapistId, { date });
        res.status(200).json(slots);
    }
    catch (error) {
        console.error('[getMySlotsForDate][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
});
exports.getMySlotsForDateHandler = getMySlotsForDateHandler;
const checkHasActiveSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapistId = yield getTherapistId(req.user.userId);
        const hasActive = yield therapistService.hasActiveSlots(therapistId);
        res.status(200).json({ hasActiveSlots: hasActive });
    }
    catch (error) {
        console.error('[checkHasActiveSlots][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
});
exports.checkHasActiveSlotsHandler = checkHasActiveSlotsHandler;
const setAvailableSlotTimesHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapistId = yield getTherapistId(req.user.userId);
        const { slotTimes } = req.body;
        const result = yield therapistService.setAvailableSlotTimes(therapistId, slotTimes);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('[setAvailableSlotTimes][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
});
exports.setAvailableSlotTimesHandler = setAvailableSlotTimesHandler;
