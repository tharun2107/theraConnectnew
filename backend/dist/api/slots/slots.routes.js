"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const client_1 = require("@prisma/client");
const slots_controller_1 = require("./slots.controller");
const slots_validation_1 = require("./slots.validation");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Public route for anyone logged in (e.g., parents) to see slots
router.post('/', (0, validate_middleware_1.validate)({ body: slots_validation_1.getAvailableSlotsSchema.shape.body }), slots_controller_1.getAvailableSlotsHandler);
// Parent-only route to book a slot
router.post('/book', (0, auth_middleware_1.authorize)([client_1.Role.PARENT]), (0, validate_middleware_1.validate)({ body: slots_validation_1.bookSlotSchema.shape.body }), slots_controller_1.bookSlotHandler);
exports.default = router;
