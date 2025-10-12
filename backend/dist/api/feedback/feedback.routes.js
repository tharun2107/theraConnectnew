"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedback_controller_1 = require("./feedback.controller");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const feedback_validation_1 = require("./feedback.validation");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Test endpoint (no auth required)
router.get('/test', (req, res) => {
    res.json({ message: 'Feedback API is working', timestamp: new Date().toISOString() });
});
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Parent routes
router.post('/feedback', (0, validate_middleware_1.validate)(feedback_validation_1.createFeedbackSchema), feedback_controller_1.createFeedbackHandler);
router.put('/consent', (0, validate_middleware_1.validate)(feedback_validation_1.updateConsentSchema), feedback_controller_1.updateConsentHandler);
// Therapist routes
router.post('/session-report', (0, validate_middleware_1.validate)(feedback_validation_1.createSessionReportSchema), feedback_controller_1.createSessionReportHandler);
// Common routes
router.get('/session/:bookingId', feedback_controller_1.getSessionDetailsHandler);
exports.default = router;
