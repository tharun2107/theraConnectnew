"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateUserFromProvider = exports.changePassword = exports.login = exports.registerAdmin = exports.registerTherapist = exports.registerParent = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const prisma = new client_1.PrismaClient();
const registerParent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password, name, phone, timezone } = input;
    try {
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        return yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: client_1.Role.PARENT,
                    name,
                    phone,
                    timezone: timezone || "UTC",
                },
            });
            yield tx.parentProfile.create({
                data: {
                    userId: user.id,
                    name,
                    phone,
                },
            });
            return user;
        }));
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                // Unique field error
                const target = Array.isArray((_a = error.meta) === null || _a === void 0 ? void 0 : _a.target)
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
});
exports.registerParent = registerParent;
const registerTherapist = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phone, specialization, experience, baseCostPerSession, } = input;
    // Pre-checks
    const [existingUser, existingPhone] = yield Promise.all([
        prisma.user.findUnique({ where: { email } }),
        prisma.therapistProfile.findUnique({ where: { phone } }).catch(() => null),
    ]);
    if (existingUser)
        throw new Error('User with this email already exists');
    if (existingPhone)
        throw new Error('Therapist with this phone already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    try {
        return yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: { email, password: hashedPassword, role: client_1.Role.THERAPIST, name }, // <-- FIXED: Added name to User
            });
            yield tx.therapistProfile.create({
                data: {
                    userId: user.id,
                    name,
                    phone,
                    specialization,
                    experience,
                    baseCostPerSession,
                    status: client_1.TherapistStatus.PENDING_VERIFICATION, // <-- CHANGED: This is safer than ACTIVE
                },
            });
            return user;
        }));
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002') {
            throw new Error('An account with this email/phone already exists');
        }
        throw error;
    }
});
exports.registerTherapist = registerTherapist;
const registerAdmin = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = input;
    const existingUser = yield prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User with this email already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: { email, password: hashedPassword, role: client_1.Role.ADMIN, name },
        });
        yield tx.adminProfile.create({ data: { userId: user.id } });
        return user;
    }));
});
exports.registerAdmin = registerAdmin;
// --- Manual Login / Password Services ---
const login = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = input;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid email or password');
    // FIXED: Check if user registered with OAuth (no password)
    if (!user.password) {
        throw new Error('Account exists, but no password is set. Please log in using the method you signed up with (e.g., Google).');
    }
    const isPasswordValid = yield (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid)
        throw new Error('Invalid email or password');
    const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    return { user: userWithoutPassword, token };
});
exports.login = login;
const changePassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, currentPassword, newPassword, }) {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('No account found with this email');
    // FIXED: Check if user registered with OAuth (no password)
    if (!user.password) {
        throw new Error('This account was created using a social provider (like Google) and does not have a password. You cannot change it.');
    }
    const isValid = yield (0, password_1.comparePassword)(currentPassword, user.password);
    if (!isValid)
        throw new Error('Current password is incorrect');
    const hashed = yield (0, password_1.hashPassword)(newPassword);
    yield prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
    });
    return { message: 'Password updated successfully' };
});
exports.changePassword = changePassword;
// --- OAuth Service ---
/**
 * Finds an existing user or creates a new one based on a provider profile.
 * This function handles linking OAuth accounts to existing email users.
 */
const findOrCreateUserFromProvider = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const provider = profile.provider || 'google';
    const providerAccountId = profile.id;
    const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
    const name = profile.displayName;
    const image = (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
    if (!email) {
        throw new Error('No email found from Google profile');
    }
    // Use a transaction to ensure data integrity
    const user = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Check if the Account already exists
        const account = yield tx.account.findUnique({
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
        const existingUser = yield tx.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            // 3. User exists (e.g., manual signup). Link the new Account to them.
            yield tx.account.create({
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
        const newUser = yield tx.user.create({
            data: {
                email,
                name,
                image,
                role: client_1.Role.PARENT,
                emailVerified: new Date(), // Email is verified by Google
            },
        });
        // Create the associated ParentProfile
        yield tx.parentProfile.create({
            data: {
                userId: newUser.id,
                name: name || 'New User', // Fallback name
            },
        });
        // Create the Account to link it
        yield tx.account.create({
            data: {
                userId: newUser.id,
                type: 'oauth',
                provider,
                providerAccountId,
            },
        });
        return newUser;
    }));
    return user;
});
exports.findOrCreateUserFromProvider = findOrCreateUserFromProvider;
