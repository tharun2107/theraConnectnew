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
exports.getMyBookingsHandler = exports.createBookingHandler = exports.getAvailableSlotsHandler = exports.markSessionCompletedHandler = void 0;
const bookingService = __importStar(require("./booking.service"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const markSessionCompletedHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const updatedBooking = yield bookingService.markSessionCompleted(bookingId);
        res.status(200).json({
            message: 'Session marked as completed',
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error('[booking.markSessionCompleted][ERROR]', error);
        res.status(400).json({ message: error.message || 'Failed to mark session as completed' });
    }
});
exports.markSessionCompletedHandler = markSessionCompletedHandler;
const getAvailableSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const validated = (_b = (_a = res.locals) === null || _a === void 0 ? void 0 : _a.validated) === null || _b === void 0 ? void 0 : _b.query;
        const { therapistId, date } = validated !== null && validated !== void 0 ? validated : req.query;
        console.log('[booking.getAvailableSlots] params=', { therapistId, date });
        const slots = yield bookingService.getAvailableSlots(therapistId, date);
        console.log('[booking.getAvailableSlots] results=', slots.length);
        res.status(200).json(slots);
    }
    catch (error) {
        console.error('[booking.getAvailableSlots][ERROR]', error);
        res.status(400).json({ message: error.message || 'Failed to get slots' });
    }
});
exports.getAvailableSlotsHandler = getAvailableSlotsHandler;
const createBookingHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('[booking.create] body=', req.body);
        const parentProfile = yield prisma_1.default.parentProfile.findUnique({ where: { userId: req.user.userId } });
        if (!parentProfile)
            return res.status(404).json({ message: 'Parent profile not found' });
        const booking = yield bookingService.createBooking(parentProfile.id, req.body);
        res.status(201).json(booking);
    }
    catch (error) {
        console.error('[booking.create][ERROR]', error);
        res.status(400).json({ message: error.message });
    }
});
exports.createBookingHandler = createBookingHandler;
const getMyBookingsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield bookingService.getMyBookings(req.user.userId, req.user.role);
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve bookings' });
    }
});
exports.getMyBookingsHandler = getMyBookingsHandler;
