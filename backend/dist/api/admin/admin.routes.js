"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const admin_controller_1 = require("./admin.controller");
const admin_validation_1 = require("./admin.validation");
const router = (0, express_1.Router)();
// All routes in this file are protected and for Admins only
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.ADMIN]));
router.get('/therapists', admin_controller_1.getAllTherapistsHandler);
router.patch('/therapists/:therapistId/status', (0, validate_middleware_1.validate)({ body: admin_validation_1.updateTherapistStatusSchema.shape.body, params: admin_validation_1.updateTherapistStatusSchema.shape.params }), admin_controller_1.updateTherapistStatusHandler);
exports.default = router;
