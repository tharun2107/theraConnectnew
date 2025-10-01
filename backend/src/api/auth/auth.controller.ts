import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { signJwt } from '../../utils/jwt';

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
    res.status(201).json({ message: 'Therapist registration pending approval', user: userWithoutPassword, token });
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