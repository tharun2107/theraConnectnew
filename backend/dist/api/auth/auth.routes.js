"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post('/register/parent', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerParentSchema.shape.body }), auth_controller_1.registerParentHandler);
router.post('/register/therapist', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerTherapistSchema.shape.body }), auth_controller_1.registerTherapistHandler);
router.post('/register/adminthera-connect395', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerAdminSchema.shape.body }), auth_controller_1.registerAdminHandler);
//login
router.post('/login', (0, validate_middleware_1.validate)({ body: auth_validation_1.loginSchema.shape.body }), auth_controller_1.loginHandler);
router.post('/change-password', (0, validate_middleware_1.validate)({ body: auth_validation_1.changePasswordSchema.shape.body }), auth_controller_1.changePasswordHandler);
//  Google OAuth
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'], accessType: 'offline', prompt: 'consent' }));
// Google redirects here after user login
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: '/login',
    session: false,
}), auth_controller_1.googleCallbackHandler);
exports.default = router;
