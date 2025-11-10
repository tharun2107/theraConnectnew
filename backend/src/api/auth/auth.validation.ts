import { z } from 'zod';

export const registerParentSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters long." }),
  }),
});

export const registerTherapistSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }).optional(), // Optional for admin-created therapists (Google OAuth)
    name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters long." }),
    specialization: z.string().min(3, { message: "Specialization must be at least 3 characters long." }),
    experience: z.number().int().positive({ message: "Experience must be a positive integer." }),
    baseCostPerSession: z.number().positive({ message: "Base cost per session must be a positive number." }),
  }),
}).strict();

export const registerAdminSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
    name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 characters long." }).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address." }),
    password: z.string({ message: "Password is required." }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Please provide a valid email address." }),
    currentPassword: z.string().min(8, { message: "Current password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  }),
});

export const googleOAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(10, { message: 'Invalid Google ID token' }),
  }),
});

