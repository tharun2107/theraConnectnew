import { Role, Prisma, TherapistStatus } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../../utils/config';
import type {
  registerParentSchema,
  registerTherapistSchema,
  registerAdminSchema,
  loginSchema,
} from './auth.validation';
import type { googleOAuthSchema } from './auth.validation';

import prisma from '../../utils/prisma';
const googleClient = new OAuth2Client(config.google.clientId);

type RegisterParentInput = z.infer<typeof registerParentSchema>['body'];
type RegisterTherapistInput = z.infer<typeof registerTherapistSchema>['body'];
type RegisterAdminInput = z.infer<typeof registerAdminSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];
type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>['body'];

type ChangePasswordInput = { email: string; currentPassword: string; newPassword: string };

export const registerParent = async (input: RegisterParentInput) => {
  const { email, password, name, phone } = input;
  console.log('[AUTH][REGISTER_PARENT] Attempt:', { email })
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
    console.log('[AUTH][REGISTER_THERAPIST] Attempt:', { email, phone, hasPassword: !!password })

    // Pre-checks to surface conflicts as 409
    const [existingUser, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.therapistProfile.findUnique({ where: { phone } }).catch(() => null),
    ]);
    if (existingUser) throw new Error('User with this email already exists');
    if (existingPhone) throw new Error('Therapist with this phone already exists');

    // Hash password if provided (for self-registration), otherwise use empty string (for admin-created, OAuth-only)
    const hashedPassword = password ? await hashPassword(password) : '';
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
  console.log('[AUTH][REGISTER_ADMIN] Attempt:', { email })
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User with this email already exists');

  const hashedPassword = await hashPassword(password);
  return prisma.$transaction(async (tx) => {
    
    const user = await tx.user.create({
      data: { email, password: hashedPassword, role: Role.ADMIN, name },
    });
 
    await tx.adminProfile.create({ data: { userId: user.id } });
    return user;
  });
};

export const changePassword = async ({ email, currentPassword, newPassword }: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found with this email');
  if (!user.password) throw new Error('No password set for this account');

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
  if (!user.password) throw new Error('Invalid email or password');

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  const token = signJwt({ userId: user.id, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const loginWithGoogle = async (input: GoogleOAuthInput) => {
  const { idToken } = input;
  console.log('[AUTH][GOOGLE] Config check:', { 
    hasClientId: !!config.google.clientId, 
    clientIdLength: config.google.clientId?.length || 0,
    envVar: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing'
  });
  if (!config.google.clientId) {
    console.error('[AUTH][GOOGLE] Missing GOOGLE_CLIENT_ID - Check your .env file')
    throw new Error('Google OAuth not configured - Missing GOOGLE_CLIENT_ID');
  }
  console.log('[AUTH][GOOGLE] Verifying ID token (len):', idToken?.length)
  const ticket = await googleClient.verifyIdToken({ idToken, audience: config.google.clientId });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    console.error('[AUTH][GOOGLE] Token verification failed, no email in payload')
    throw new Error('Google token verification failed');
  }

  const email = payload.email;
  const nameFromGoogle = payload.name || email.split('@')[0];

  // Find existing user
  let user = await prisma.user.findUnique({ where: { email } });
  console.log('[AUTH][GOOGLE] Lookup user by email:', email)

  if (!user) {
    // Assume first-time parent sign-in → create PARENT user with minimal profile
    console.log('[AUTH][GOOGLE] Creating new PARENT for', email)
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          password: '', // OAuth users have no local password
          role: Role.PARENT,
        },
      });
      await tx.parentProfile.create({
        data: { userId: created.id, name: nameFromGoogle, phone: null as any },
      });
      return created;
    });
  }

  // If therapist is pre-registered by admin, just allow login; role is already set
  const token = signJwt({ userId: user.id, role: user.role });
  const { password: _pw, ...userWithoutPassword } = user as any;

  // Indicate whether profile completion may be needed for parents (no phone)
  let needsProfileCompletion = false;
  if (user.role === Role.PARENT) {
    const parent = await prisma.parentProfile.findUnique({ where: { userId: user.id } });
    needsProfileCompletion = !parent?.phone;
    console.log('[AUTH][GOOGLE] needsProfileCompletion:', needsProfileCompletion)
  }

  return { user: userWithoutPassword, token, needsProfileCompletion };
};