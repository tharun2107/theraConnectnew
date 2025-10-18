import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { signJwt } from '../../utils/jwt';
import { z } from 'zod';
import { googleOAuthSchema } from './auth.validation';

const handleServiceError = (res: Response, error: any) => {
    const isConflict = error.message?.includes('exists');
    return res.status(isConflict ? 409 : 500).json({ message: error.message });
};

export const registerParentHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerParent(req.body);
    const { password, ...userWithoutPassword } = user;
    const token = signJwt({ userId: user.id, role: user.role });
    res.status(201).json({ message: 'Parent registered successfully', user: userWithoutPassword ,token});
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const registerTherapistHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerTherapist(req.body);
    const  token = signJwt({ userId: user.id, role: user.role });
    const { password, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'Therapist registered successfully', user: userWithoutPassword, token });
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const registerAdminHandler = async (req: Request, res: Response) => {
  try {
    const user = await authService.registerAdmin(req.body);
    const { password, ...userWithoutPassword } = user;
    const token = signJwt({ userId: user.id, role: user.role });
    res.status(201).json({ message: 'Admin registered successfully', user: userWithoutPassword,token });
  } catch (error) {
    handleServiceError(res, error);
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const result = await authService.changePassword(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    const status = /incorrect|No account/i.test(error.message) ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const googleOAuthHandler = async (req: Request, res: Response) => {
  try {
    // Basic debug without logging tokens
    console.log('[AUTH][GOOGLE] Incoming request to /auth/google')
    const parsed = googleOAuthSchema.parse({ body: req.body });
    console.log('[AUTH][GOOGLE] Payload received (token length):', parsed.body.idToken?.length)
    const result = await authService.loginWithGoogle(parsed.body);
    console.log('[AUTH][GOOGLE] Login success for user', result?.user?.email)
    res.status(200).json(result);
  } catch (error: any) {
    const status = error?.issues ? 400 : 401;
    console.error('[AUTH][GOOGLE][ERROR]', error?.message || error)
    res.status(status).json({ message: error.message || 'Google login failed' });
  }
};