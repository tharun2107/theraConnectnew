"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
// Public Routes
router.post('/register/parent', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerParentSchema.shape.body }), auth_controller_1.registerParentHandler);
router.post('/register/therapist', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerTherapistSchema.shape.body }), auth_controller_1.registerTherapistHandler);
router.post('/login', (0, validate_middleware_1.validate)({ body: auth_validation_1.loginSchema.shape.body }), auth_controller_1.loginHandler);
router.post('/change-password', (0, validate_middleware_1.validate)({ body: auth_validation_1.changePasswordSchema.shape.body }), auth_controller_1.changePasswordHandler);
router.post('/google', (0, validate_middleware_1.validate)({ body: auth_validation_1.googleOAuthSchema.shape.body }), auth_controller_1.googleOAuthHandler);
// Restricted Admin Registration - should only be used for setup
router.post('/register/adminthera-connect395', (0, validate_middleware_1.validate)({ body: auth_validation_1.registerAdminSchema.shape.body }), auth_controller_1.registerAdminHandler);
exports.default = router;
