import { Router } from 'express';
import passport from 'passport';
import { validate } from '../../middleware/validate.middleware';
import {
  registerParentHandler,
  registerTherapistHandler,
  registerAdminHandler,
  loginHandler,
  changePasswordHandler,
  googleCallbackHandler,  
} from './auth.controller';
import {
  registerParentSchema,
  registerTherapistSchema,
  registerAdminSchema,
  loginSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();


router.post( '/register/parent',validate({ body: registerParentSchema.shape.body }),registerParentHandler);
router.post('/register/therapist',validate({ body: registerTherapistSchema.shape.body }),registerTherapistHandler);
router.post('/register/adminthera-connect395',validate({ body: registerAdminSchema.shape.body }),registerAdminHandler,);

//login
router.post('/login', validate({ body: loginSchema.shape.body }), loginHandler);
router.post('/change-password',validate({ body: changePasswordSchema.shape.body }), changePasswordHandler);

//  Google OAuth
router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'],accessType : 'offline',prompt : 'consent'},));

// Google redirects here after user login
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  googleCallbackHandler,
);

export default router;