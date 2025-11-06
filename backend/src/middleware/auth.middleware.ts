// src/middleware/auth.middleware.ts

import type { Request, Response, NextFunction } from 'express';
import { PrismaClient, type Role } from '@prisma/client';
// You still need UserRole for the authorize function to see it
import { UserRole, verifyJwt } from '../utils/jwt';

const prisma = new PrismaClient();



declare global {
  namespace Express {
    interface Request {
      currentUser?: UserRole;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication invalid: No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyJwt(token); // This is type UserRole (or JwtPayload)

  if (!decoded) {
    return res.status(401).json({ message: 'Authentication invalid: Invalid token.' });
  }

  // Note: You can skip this DB check if you trust your JWT.
  // The token *already* has the role.
  const userExists = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!userExists) {
    return res.status(401).json({ message: 'Authentication invalid: User not found.' });
  }

  req.currentUser = decoded; // This will now be type-safe
  next();
};

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // req.user is now correctly typed as UserRole
    if (!req.currentUser?.role) {
      return res.status(403).json({ message: 'Forbidden: Role not available.' });
    }
    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).json({ message: `Forbidden: Access denied.` });
    }
    next();
  };
};