import { PrismaClient, Role, Prisma, TherapistStatus } from '@prisma/client';
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

type ChangePasswordInput = { email: string; currentPassword: string; newPassword: string };

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

    // Pre-checks to surface conflicts as 409
    const [existingUser, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.therapistProfile.findUnique({ where: { phone } }).catch(() => null),
    ]);
    if (existingUser) throw new Error('User with this email already exists');
    if (existingPhone) throw new Error('Therapist with this phone already exists');

    const hashedPassword = await hashPassword(password);
    try {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email, password: hashedPassword, role: Role.THERAPIST },
            });
            await tx.therapistProfile.create({
                data: { userId: user.id, name, phone, specialization, experience, baseCostPerSession, status: TherapistStatus.ACTIVE },
            });
            return user;
        });
    } catch (error: any) {
        // Normalize Prisma unique constraint error to a friendly conflict message
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('An account with this email/phone already exists');
        }
        throw error;
    }
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

export const changePassword = async ({ email, currentPassword, newPassword }: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found with this email');

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) throw new Error('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return { message: 'Password updated successfully' };
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