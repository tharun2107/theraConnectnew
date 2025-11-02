import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import { getAvailableSlotsHandler, bookSlotHandler } from './slots.controller';
import { getAvailableSlotsSchema, bookSlotSchema } from './slots.validation';
const router = Router();
router.use(authenticate);

// Public route for anyone logged in (e.g., parents) to see slots
router.post('/', validate({body:getAvailableSlotsSchema.shape.body}), getAvailableSlotsHandler);

// Parent-only route to book a slot
router.post('/book', authorize([Role.PARENT]), validate({body:bookSlotSchema.shape.body}), bookSlotHandler);

export default router;
