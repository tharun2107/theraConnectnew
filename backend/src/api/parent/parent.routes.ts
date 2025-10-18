import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { Role } from '@prisma/client';
import {
  getMyProfileHandler,
  updateMyProfileHandler,
  getMyChildrenHandler,
  addChildHandler,
  updateChildHandler,
  deleteChildHandler,
  getActiveTherapistsHandler,
} from './parent.controller';
import { childIdParamSchema, childSchema, updateChildSchema, updateParentProfileSchema } from './parent.validation';

const router = Router();

// All routes are for authenticated Parents only
router.use(authenticate, authorize([Role.PARENT]));

router.get('/me/profile', getMyProfileHandler);
router.put('/me/profile', validate({ body: updateParentProfileSchema.shape.body }), updateMyProfileHandler);

// Children CRUD
router.get('/me/children', getMyChildrenHandler);
router.post('/me/children', validate({body : childSchema.shape.body}), addChildHandler);
router.put('/me/children/:childId', validate({ body: updateChildSchema.shape.body, params: childIdParamSchema.shape.params }), updateChildHandler);
router.delete('/me/children/:childId', validate({ params: childIdParamSchema.shape.params }), deleteChildHandler);

// Public list of active therapists for parents
router.get('/therapists', getActiveTherapistsHandler);

export default router;