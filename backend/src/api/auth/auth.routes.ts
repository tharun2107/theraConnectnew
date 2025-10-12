import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  registerParentHandler,
  registerTherapistHandler,
  registerAdminHandler,
  loginHandler,
  changePasswordHandler,
} from './auth.controller';
import {
  registerParentSchema,
  registerTherapistSchema,
  registerAdminSchema,
  loginSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();

// Public Routes
router.post('/register/parent', validate({body : registerParentSchema.shape.body}), registerParentHandler);
router.post('/register/therapist', validate({body:registerTherapistSchema.shape.body}), registerTherapistHandler);
router.post('/login', validate({body :loginSchema.shape.body}), loginHandler);
router.post('/change-password', validate({ body: changePasswordSchema.shape.body }), changePasswordHandler);

// Restricted Admin Registration - should only be used for setup
router.post('/register/adminthera-connect395', validate({body:registerAdminSchema.shape.body}), registerAdminHandler);

export default router;