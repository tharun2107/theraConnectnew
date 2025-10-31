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
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const therapist_controller_1 = require("./therapist.controller");
const therapist_validation_1 = require("./therapist.validation");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const router = (0, express_1.Router)();
// Public route for listing active therapists - MUST be before auth middleware
router.get('/public', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Public therapists endpoint hit!'); // Debug log
        const therapists = yield prisma_1.default.therapistProfile.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                specialization: true,
                experience: true,
                baseCostPerSession: true,
                averageRating: true,
            },
        });
        console.log('Found therapists:', therapists.length); // Debug log
        res.json(therapists);
    }
    catch (error) {
        console.error('Error in public therapists endpoint:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
}));
// Test route to verify public access
router.get('/test', (req, res) => {
    res.json({ message: 'Public test route works!' });
});
// Protected routes for therapists
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.THERAPIST]));
router.get('/me/profile', therapist_controller_1.getMyProfileHandler);
router.get('/me/slots/check', therapist_controller_1.checkHasActiveSlotsHandler);
router.put('/me/slots/available-times', (0, validate_middleware_1.validate)({ body: therapist_validation_1.setAvailableSlotTimesSchema.shape.body }), therapist_controller_1.setAvailableSlotTimesHandler);
router.post('/me/slots', (0, validate_middleware_1.validate)({ body: therapist_validation_1.createTimeSlotsSchema.shape.body }), // <-- just the schema
therapist_controller_1.createTimeSlotsHandler);
router.get('/me/slots', (0, validate_middleware_1.validate)({ query: therapist_validation_1.getSlotsForDateSchema.shape.query }), therapist_controller_1.getMySlotsForDateHandler);
router.post('/me/leaves', (0, validate_middleware_1.validate)({ body: therapist_validation_1.requestLeaveSchema.shape.body }), therapist_controller_1.requestLeaveHandler);
exports.default = router;
