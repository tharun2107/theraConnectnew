import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
 import { config } from './config';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export const signJwt = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any, // assert type
  };

  return jwt.sign(payload, config.jwt.secret as Secret, options);
};

export const verifyJwt = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
};
