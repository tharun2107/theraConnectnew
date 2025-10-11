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
exports.getSessionDetailsHandler = exports.updateConsentHandler = exports.createSessionReportHandler = exports.createFeedbackHandler = void 0;
const feedbackService = __importStar(require("./feedback.service"));
const handleServiceError = (res, error) => {
    var _a, _b, _c, _d;
    const isConflict = (_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('already');
    const isNotFound = (_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('not found');
    const isValidation = ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('required')) || ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('must be'));
    let status = 500;
    if (isNotFound)
        status = 404;
    else if (isConflict)
        status = 409;
    else if (isValidation)
        status = 400;
    return res.status(status).json({ message: error.message });
};
const createFeedbackHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📝 Creating feedback:', req.body);
        const feedback = yield feedbackService.createFeedback(req.body);
        console.log('✅ Feedback created successfully:', feedback);
        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });
    }
    catch (error) {
        console.error('❌ Error creating feedback:', error);
        handleServiceError(res, error);
    }
});
exports.createFeedbackHandler = createFeedbackHandler;
const createSessionReportHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📋 Creating session report:', req.body);
        const report = yield feedbackService.createSessionReport(req.body);
        console.log('✅ Session report created successfully:', report);
        res.status(201).json({
            message: 'Session report created successfully',
            report
        });
    }
    catch (error) {
        console.error('❌ Error creating session report:', error);
        handleServiceError(res, error);
    }
});
exports.createSessionReportHandler = createSessionReportHandler;
const updateConsentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const consent = yield feedbackService.updateConsent(req.body);
        res.status(200).json({
            message: 'Consent updated successfully',
            consent
        });
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
exports.updateConsentHandler = updateConsentHandler;
const getSessionDetailsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        const sessionDetails = yield feedbackService.getSessionDetails(bookingId);
        res.status(200).json({ sessionDetails });
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
exports.getSessionDetailsHandler = getSessionDetailsHandler;
