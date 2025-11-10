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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectLeaveRequestHandler = exports.approveLeaveRequestHandler = exports.listLeaveRequestsHandler = exports.updateTherapistStatusHandler = exports.updatePlatformSettingsHandler = exports.getPlatformSettingsHandler = exports.updateProfileHandler = exports.getProfileHandler = exports.getAllBookingsHandler = exports.getChildSessionsHandler = exports.getAllChildrenHandler = exports.getTherapistSessionsHandler = exports.getAllTherapistsHandler = void 0;
const adminService = __importStar(require("./admin.service"));
const getAllTherapistsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const therapists = yield adminService.getAllTherapists();
        res.status(200).json(therapists);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve therapists' });
    }
});
exports.getAllTherapistsHandler = getAllTherapistsHandler;
const getTherapistSessionsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { therapistId } = req.params;
        const sessions = yield adminService.getTherapistSessions(therapistId);
        res.status(200).json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve therapist sessions' });
    }
});
exports.getTherapistSessionsHandler = getTherapistSessionsHandler;
const getAllChildrenHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const children = yield adminService.getAllChildren();
        res.status(200).json(children);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve children' });
    }
});
exports.getAllChildrenHandler = getAllChildrenHandler;
const getChildSessionsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { childId } = req.params;
        const sessions = yield adminService.getChildSessions(childId);
        res.status(200).json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve child sessions' });
    }
});
exports.getChildSessionsHandler = getChildSessionsHandler;
const getAllBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield adminService.getAllBookings();
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve bookings' });
    }
});
exports.getAllBookingsHandler = getAllBookingsHandler;
const getProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = yield adminService.getProfile(userId);
        res.status(200).json(profile);
    }
    catch (error) {
        if (error.message === 'Admin profile not found') {
            return res.status(404).json({ message: error.message });
        }
        console.error('[admin.controller.getProfileHandler] Error:', error);
        res.status(500).json({ message: error.message || 'Failed to retrieve profile' });
    }
});
exports.getProfileHandler = getProfileHandler;
const updateProfileHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profile = yield adminService.updateProfile(userId, req.body);
        res.status(200).json(profile);
    }
    catch (error) {
        console.error('[admin.controller.updateProfileHandler] Error:', error);
        res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
});
exports.updateProfileHandler = updateProfileHandler;
const getPlatformSettingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield adminService.getPlatformSettings();
        res.status(200).json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve platform settings' });
    }
});
exports.getPlatformSettingsHandler = getPlatformSettingsHandler;
const updatePlatformSettingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield adminService.updatePlatformSettings(req.body);
        res.status(200).json(settings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update platform settings' });
    }
});
exports.updatePlatformSettingsHandler = updatePlatformSettingsHandler;
const updateTherapistStatusHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { therapistId } = req.params;
        const { status } = req.body;
        const therapist = yield adminService.updateTherapistStatus(therapistId, status);
        res.status(200).json(therapist);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update therapist status' });
    }
});
exports.updateTherapistStatusHandler = updateTherapistStatusHandler;
const listLeaveRequestsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaves = yield adminService.listLeaveRequests();
        res.status(200).json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve leave requests' });
    }
});
exports.listLeaveRequestsHandler = listLeaveRequestsHandler;
const approveLeaveRequestHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leaveId } = req.params;
        const result = yield adminService.approveLeaveRequest(leaveId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to approve leave request' });
    }
});
exports.approveLeaveRequestHandler = approveLeaveRequestHandler;
const rejectLeaveRequestHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { leaveId } = req.params;
        const { reason } = req.body;
        const result = yield adminService.rejectLeaveRequest(leaveId, reason);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to reject leave request' });
    }
});
exports.rejectLeaveRequestHandler = rejectLeaveRequestHandler;
