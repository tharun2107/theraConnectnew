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
exports.updateScheduleHandler = exports.setScheduleHandler = exports.getCurrentScheduleHandler = exports.getTimeSlotOptionsHandler = exports.getMySlotsForDateHandler = exports.requestLeaveHandler = exports.createTimeSlotsHandler = exports.getMyProfileHandler = void 0;
const therapistService = __importStar(require("./therapist.service"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const therapist_service_1 = require("./therapist.service");
const getTherapistId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const profile = yield prisma_1.default.therapistProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile)
        throw new Error('Therapist profile not found');
    return profile.id;
});
const getMyProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = yield therapistService.getTherapistProfile(req.currentUser.userId);
        res.status(200).json(profile);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
});
exports.getMyProfileHandler = getMyProfileHandler;
const createTimeSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapistId = yield getTherapistId(req.currentUser.userId);
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
        const therapistId = yield getTherapistId(req.currentUser.userId);
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
        const therapistId = yield getTherapistId(req.currentUser.userId);
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
const getTimeSlotOptionsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const slotOptions = therapist_service_1.therapistScheduleService.generateAllTimeSlotOptions();
        return res.status(200).json({
            success: true,
            message: 'Available time slots retrieved successfully',
            data: {
                totalSlots: slotOptions.length,
                requiredSelection: 8,
                slotDuration: '60 minutes',
                slots: slotOptions
            }
        });
    }
    catch (error) {
        console.error('Error fetching time slot options:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve time slot options',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTimeSlotOptionsHandler = getTimeSlotOptionsHandler;
const getCurrentScheduleHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.userId;
        const scheduleData = yield therapist_service_1.therapistScheduleService.getCurrentSchedule(userId);
        return res.status(200).json({
            success: true,
            message: 'Current schedule retrieved successfully',
            data: scheduleData
        });
    }
    catch (error) {
        console.error('Error fetching current schedule:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve current schedule',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getCurrentScheduleHandler = getCurrentScheduleHandler;
const setScheduleHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.currentUser.userId;
        const scheduleData = req.body;
        // Set the permanent schedule and generate future slots
        const updatedProfile = yield therapist_service_1.therapistScheduleService.setPermanentSchedule(userId, scheduleData);
        return res.status(200).json({
            success: true,
            message: 'Schedule updated successfully.',
            data: {
                selectedSlots: updatedProfile.selectedSlots,
                slotDurationInMinutes: updatedProfile.slotDurationInMinutes,
                maxSlotsPerDay: updatedProfile.maxSlotsPerDay,
            }
        });
    }
    catch (error) {
        console.error('Error setting schedule:', error);
        // Handle specific error cases
        if (error instanceof Error) {
            if (error.message.includes('must select exactly')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('Duplicate')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('Invalid')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
        }
        return res.status(500).json({
            success: false,
            message: 'Failed to set schedule',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.setScheduleHandler = setScheduleHandler;
const updateScheduleHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Use the same logic as setScheduleHandler
    return (0, exports.setScheduleHandler)(req, res);
});
exports.updateScheduleHandler = updateScheduleHandler;
