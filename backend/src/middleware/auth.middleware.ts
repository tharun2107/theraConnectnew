import type { Request, Response, NextFunction } from 'express';
import { type Role } from '@prisma/client';
import { verifyJwt, type JwtPayload } from '../utils/jwt';
import prisma from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid: No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyJwt(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Authentication invalid: Invalid token.' });
  }

  const userExists = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!userExists) {
    return res.status(401).json({ message: 'Authentication invalid: User not found.' });
  }

  req.user = decoded;
  next();
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Forbidden: Role not available.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Access denied.` });
    }
    next();
  };
};