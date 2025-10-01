import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import type {
  registerParentSchema,
  registerTherapistSchema,
  registerAdminSchema,
  loginSchema,
} from './auth.validation';

const prisma = new PrismaClient();

type RegisterParentInput = z.infer<typeof registerParentSchema>['body'];
type RegisterTherapistInput = z.infer<typeof registerTherapistSchema>['body'];
type RegisterAdminInput = z.infer<typeof registerAdminSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];

export const registerParent = async (input: RegisterParentInput) => {
  const { email, password, name, phone } = input;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User with this email already exists');

  const hashedPassword = await hashPassword(password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: hashedPassword, role: Role.PARENT },
    });
    await tx.parentProfile.create({ data: { userId: user.id, name, phone } });
    return user;
  });
};

export const registerTherapist = async (input: RegisterTherapistInput) => {
    const { email, password, name, phone, specialization, experience, baseCostPerSession } = input;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User with this email already exists');

    const hashedPassword = await hashPassword(password);
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: { email, password: hashedPassword, role: Role.THERAPIST },
        });
        await tx.therapistProfile.create({
            data: { userId: user.id, name, phone, specialization, experience, baseCostPerSession },
        });
        return user;
    });
};

export const registerAdmin = async (input: RegisterAdminInput) => {
  const { email, password, name } = input;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User with this email already exists');

  const hashedPassword = await hashPassword(password);
  return prisma.$transaction(async (tx) => {
    
    const user = await tx.user.create({
      data: { email, password: hashedPassword, role: Role.ADMIN},
    });
 
    await tx.adminProfile.create({ data: { userId: user.id, name} });
    return user;
  });
};

export const login = async (input: LoginInput) => {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  const token = signJwt({ userId: user.id, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};