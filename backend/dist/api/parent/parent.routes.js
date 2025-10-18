"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const parent_controller_1 = require("./parent.controller");
const parent_validation_1 = require("./parent.validation");
const router = (0, express_1.Router)();
// All routes are for authenticated Parents only
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)([client_1.Role.PARENT]));
router.get('/me/profile', parent_controller_1.getMyProfileHandler);
router.put('/me/profile', (0, validate_middleware_1.validate)({ body: parent_validation_1.updateParentProfileSchema.shape.body }), parent_controller_1.updateMyProfileHandler);
// Children CRUD
router.get('/me/children', parent_controller_1.getMyChildrenHandler);
router.post('/me/children', (0, validate_middleware_1.validate)({ body: parent_validation_1.childSchema.shape.body }), parent_controller_1.addChildHandler);
router.put('/me/children/:childId', (0, validate_middleware_1.validate)({ body: parent_validation_1.updateChildSchema.shape.body, params: parent_validation_1.childIdParamSchema.shape.params }), parent_controller_1.updateChildHandler);
router.delete('/me/children/:childId', (0, validate_middleware_1.validate)({ params: parent_validation_1.childIdParamSchema.shape.params }), parent_controller_1.deleteChildHandler);
// Public list of active therapists for parents
router.get('/therapists', parent_controller_1.getActiveTherapistsHandler);
exports.default = router;
