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
exports.bookSlotHandler = exports.getAvailableSlotsHandler = void 0;
const slotsService = __importStar(require("./slots.service"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getAvailableSlotsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { therapistId, date } = req.body;
        const availableSlots = yield slotsService.generateAndGetAvailableSlots(therapistId, date);
        res.status(200).json(availableSlots);
    }
    catch (error) {
        console.error(error);
        res.status(404).json({ message: error.message });
    }
});
exports.getAvailableSlotsHandler = getAvailableSlotsHandler;
const bookSlotHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timeSlotId, childId } = req.body;
        const parentProfile = yield prisma_1.default.parentProfile.findUniqueOrThrow({
            where: { userId: req.user.userId },
        });
        const booking = yield slotsService.bookSlot(parentProfile.id, childId, timeSlotId);
        res.status(201).json({ message: 'Booking successful!', booking });
    }
    catch (error) {
        // A thrown error from the transaction often means a booking conflict
        res.status(409).json({ message: 'Failed to book slot. It may have been taken.' });
    }
});
exports.bookSlotHandler = bookSlotHandler;
