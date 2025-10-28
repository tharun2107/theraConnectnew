import { PrismaClient, Role, Prisma, TherapistStatus, User } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, comparePassword } from '../../utils/password';
import { signJwt } from '../../utils/jwt';
import type {
  registerParentSchema,
  registerTherapistSchema,
  registerAdminSchema,
  loginSchema,
  changePasswordSchema,
} from './auth.validation';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';

const prisma = new PrismaClient();

// --- Types ---
type RegisterParentInput = z.infer<typeof registerParentSchema>['body'];
type RegisterTherapistInput = z.infer<typeof registerTherapistSchema>['body'];
type RegisterAdminInput = z.infer<typeof registerAdminSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];
type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>['body'];

 export const registerParent = async (input: RegisterParentInput) => {
  const { email, password, name, phone, timezone } = input;

  try {
    const hashedPassword = await hashPassword(password);

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Role.PARENT,
          name,
          phone,
          timezone: timezone || "UTC",
        },
      });

      await tx.parentProfile.create({
        data: {
          userId: user.id,
          name,
          phone,
        },
      });

      return user;
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        // Unique field error
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target[0]
          : undefined;

        if (target === "email") {
          throw new Error("Email already registered");
        }

        if (target === "phone") {
          throw new Error("Phone number already registered");
        }
      }

    }

    throw new Error("Registration failed");
  }
};

export const registerTherapist = async (input: RegisterTherapistInput) => {
  const {
    email,
    password,
    name,
    phone,
    specialization,
    experience,
    baseCostPerSession,
  } = input;

  // Pre-checks
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
        data: { email, password: hashedPassword, role: Role.THERAPIST, name }, // <-- FIXED: Added name to User
      });
      await tx.therapistProfile.create({
        data: {
          userId: user.id,
          name,
          phone,
          specialization,
          experience,
          baseCostPerSession,
          status: TherapistStatus.PENDING_VERIFICATION, // <-- CHANGED: This is safer than ACTIVE
        },
      });
      return user;
    });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error('An account with this email/phone already exists');
    }
    throw error;
  }
};

export const registerAdmin = async (input: RegisterAdminInput) => {
  const { email, password,name } = input;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error('User with this email already exists');

  const hashedPassword = await hashPassword(password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, password: hashedPassword, role: Role.ADMIN,name },
    });
  
    await tx.adminProfile.create({ data: { userId: user.id } }); 
    return user;
  });
};

// --- Manual Login / Password Services ---

export const login = async (input: LoginInput) => {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  // FIXED: Check if user registered with OAuth (no password)
  if (!user.password) {
    throw new Error(
      'Account exists, but no password is set. Please log in using the method you signed up with (e.g., Google).',
    );
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error('Invalid email or password');

  const token = signJwt({ userId: user.id, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

export const changePassword = async ({
  email,
  currentPassword,
  newPassword,
}: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('No account found with this email');

  // FIXED: Check if user registered with OAuth (no password)
  if (!user.password) {
    throw new Error(
      'This account was created using a social provider (like Google) and does not have a password. You cannot change it.',
    );
  }

  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) throw new Error('Current password is incorrect');

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });
  return { message: 'Password updated successfully' };
};

// --- OAuth Service ---

/**
 * Finds an existing user or creates a new one based on a provider profile.
 * This function handles linking OAuth accounts to existing email users.
 */
export const findOrCreateUserFromProvider = async (
  profile: GoogleProfile,
): Promise<User> => {
  const provider = profile.provider || 'google';
  const providerAccountId = profile.id;
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName;
  const image = profile.photos?.[0]?.value;

  if (!email) {
    throw new Error('No email found from Google profile');
  }

  // Use a transaction to ensure data integrity
  const user = await prisma.$transaction(async (tx) => {
    // 1. Check if the Account already exists
    const account = await tx.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });

    if (account) {
      return account.user; // User already exists, return them
    }

    // 2. Account doesn't exist. Check if a User with this email exists
    const existingUser = await tx.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // 3. User exists (e.g., manual signup). Link the new Account to them.
      await tx.account.create({
        data: {
          userId: existingUser.id,
          type: 'oauth',
          provider,
          providerAccountId,
        },
      });
      return existingUser;
    }

    // 4. No User, No Account. Create a new User, ParentProfile, and Account.
    // By default, new OAuth signups are 'PARENT'
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        image,
        role: Role.PARENT,
        emailVerified: new Date(), // Email is verified by Google
      },
    });

    // Create the associated ParentProfile
    await tx.parentProfile.create({
      data: {
        userId: newUser.id,
        name: name || 'New User', // Fallback name
      },
    });

    // Create the Account to link it
    await tx.account.create({
      data: {
        userId: newUser.id,
        type: 'oauth',
        provider,
        providerAccountId,
      },
    });

    return newUser;
  });

  return user;
};