import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import { getAllTherapistsHandler, updateTherapistStatusHandler } from './admin.controller';
import { updateTherapistStatusSchema } from './admin.validation';

const router = Router();

// All routes in this file are protected and for Admins only
router.use(authenticate, authorize([Role.ADMIN]));

router.get('/therapists', getAllTherapistsHandler);
router.patch('/therapists/:therapistId/status',validate({ body: updateTherapistStatusSchema.shape.body,params: updateTherapistStatusSchema.shape.params}),updateTherapistStatusHandler);
export default router;