"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerAdminSchema = exports.registerTherapistSchema = exports.registerParentSchema = void 0;
const zod_1 = require("zod");
exports.registerParentSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Please provide a valid email address." }),
        password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long." }),
        name: zod_1.z.string().min(2, { message: "Name must be at least 2 characters long." }),
        phone: zod_1.z.string().min(10, { message: "Phone number must be at least 10 characters long." }),
    }),
});
exports.registerTherapistSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Please provide a valid email address." }),
        password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long." }).optional(), // Optional for admin-created therapists (Google OAuth)
        name: zod_1.z.string().min(2, { message: "Name must be at least 2 characters long." }),
        phone: zod_1.z.string().min(10, { message: "Phone number must be at least 10 characters long." }),
        specialization: zod_1.z.string().min(3, { message: "Specialization must be at least 3 characters long." }),
        experience: zod_1.z.number().int().positive({ message: "Experience must be a positive integer." }),
        baseCostPerSession: zod_1.z.number().positive({ message: "Base cost per session must be a positive number." }),
    }),
}).strict();
exports.registerAdminSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Please provide a valid email address." }),
        password: zod_1.z.string().min(8, { message: "Password must be at least 8 characters long." }),
        name: zod_1.z.string().min(2, { message: "Name must be at least 2 characters long." }),
        phone: zod_1.z.string().min(10, { message: "Phone number must be at least 10 characters long." }).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Please provide a valid email address." }),
        password: zod_1.z.string({ message: "Password is required." }),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email({ message: "Please provide a valid email address." }),
        currentPassword: zod_1.z.string().min(8, { message: "Current password must be at least 8 characters." }),
        newPassword: zod_1.z.string().min(8, { message: "New password must be at least 8 characters." }),
    }),
});
exports.googleOAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(10, { message: 'Invalid Google ID token' }),
    }),
});
