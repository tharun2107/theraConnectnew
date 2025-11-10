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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithGoogle = exports.login = exports.changePassword = exports.registerAdmin = exports.registerTherapist = exports.registerParent = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../../utils/config");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const googleClient = new google_auth_library_1.OAuth2Client(config_1.config.google.clientId);
const registerParent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phone } = input;
    console.log('[AUTH][REGISTER_PARENT] Attempt:', { email });
    const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User with this email already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: { email, password: hashedPassword, role: client_1.Role.PARENT },
        });
        yield tx.parentProfile.create({ data: { userId: user.id, name, phone } });
        return user;
    }));
});
exports.registerParent = registerParent;
const registerTherapist = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phone, specialization, experience, baseCostPerSession } = input;
    console.log('[AUTH][REGISTER_THERAPIST] Attempt:', { email, phone, hasPassword: !!password });
    // Pre-checks to surface conflicts as 409
    const [existingUser, existingPhone] = yield Promise.all([
        prisma_1.default.user.findUnique({ where: { email } }),
        prisma_1.default.therapistProfile.findUnique({ where: { phone } }).catch(() => null),
    ]);
    if (existingUser)
        throw new Error('User with this email already exists');
    if (existingPhone)
        throw new Error('Therapist with this phone already exists');
    // Hash password if provided (for self-registration), otherwise use empty string (for admin-created, OAuth-only)
    const hashedPassword = password ? yield (0, password_1.hashPassword)(password) : '';
    try {
        return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield tx.user.create({
                data: { email, password: hashedPassword, role: client_1.Role.THERAPIST },
            });
            yield tx.therapistProfile.create({
                data: { userId: user.id, name, phone, specialization, experience, baseCostPerSession, status: client_1.TherapistStatus.ACTIVE },
            });
            return user;
        }));
    }
    catch (error) {
        // Normalize Prisma unique constraint error to a friendly conflict message
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('An account with this email/phone already exists');
        }
        throw error;
    }
});
exports.registerTherapist = registerTherapist;
const registerAdmin = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = input;
    console.log('[AUTH][REGISTER_ADMIN] Attempt:', { email });
    const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User with this email already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: { email, password: hashedPassword, role: client_1.Role.ADMIN, name },
        });
        yield tx.adminProfile.create({ data: { userId: user.id } });
        return user;
    }));
});
exports.registerAdmin = registerAdmin;
const changePassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, currentPassword, newPassword }) {
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('No account found with this email');
    if (!user.password)
        throw new Error('No password set for this account');
    const isValid = yield (0, password_1.comparePassword)(currentPassword, user.password);
    if (!isValid)
        throw new Error('Current password is incorrect');
    const hashed = yield (0, password_1.hashPassword)(newPassword);
    yield prisma_1.default.user.update({ where: { id: user.id }, data: { password: hashed } });
    return { message: 'Password updated successfully' };
});
exports.changePassword = changePassword;
const login = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = input;
    const user = yield prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid email or password');
    if (!user.password)
        throw new Error('Invalid email or password');
    const isPasswordValid = yield (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid)
        throw new Error('Invalid email or password');
    const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    return { user: userWithoutPassword, token };
});
exports.login = login;
const loginWithGoogle = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { idToken } = input;
    console.log('[AUTH][GOOGLE] Config check:', {
        hasClientId: !!config_1.config.google.clientId,
        clientIdLength: ((_a = config_1.config.google.clientId) === null || _a === void 0 ? void 0 : _a.length) || 0,
        envVar: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing'
    });
    if (!config_1.config.google.clientId) {
        console.error('[AUTH][GOOGLE] Missing GOOGLE_CLIENT_ID - Check your .env file');
        throw new Error('Google OAuth not configured - Missing GOOGLE_CLIENT_ID');
    }
    console.log('[AUTH][GOOGLE] Verifying ID token (len):', idToken === null || idToken === void 0 ? void 0 : idToken.length);
    const ticket = yield googleClient.verifyIdToken({ idToken, audience: config_1.config.google.clientId });
    const payload = ticket.getPayload();
    if (!(payload === null || payload === void 0 ? void 0 : payload.email)) {
        console.error('[AUTH][GOOGLE] Token verification failed, no email in payload');
        throw new Error('Google token verification failed');
    }
    const email = payload.email;
    const nameFromGoogle = payload.name || email.split('@')[0];
    // Find existing user
    let user = yield prisma_1.default.user.findUnique({ where: { email } });
    console.log('[AUTH][GOOGLE] Lookup user by email:', email);
    if (!user) {
        // Assume first-time parent sign-in → create PARENT user with minimal profile
        console.log('[AUTH][GOOGLE] Creating new PARENT for', email);
        user = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const created = yield tx.user.create({
                data: {
                    email,
                    password: '', // OAuth users have no local password
                    role: client_1.Role.PARENT,
                },
            });
            yield tx.parentProfile.create({
                data: { userId: created.id, name: nameFromGoogle, phone: null },
            });
            return created;
        }));
    }
    // If therapist is pre-registered by admin, just allow login; role is already set
    const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
    const _b = user, { password: _pw } = _b, userWithoutPassword = __rest(_b, ["password"]);
    // Indicate whether profile completion may be needed for parents (no phone)
    let needsProfileCompletion = false;
    if (user.role === client_1.Role.PARENT) {
        const parent = yield prisma_1.default.parentProfile.findUnique({ where: { userId: user.id } });
        needsProfileCompletion = !(parent === null || parent === void 0 ? void 0 : parent.phone);
        console.log('[AUTH][GOOGLE] needsProfileCompletion:', needsProfileCompletion);
    }
    return { user: userWithoutPassword, token, needsProfileCompletion };
});
exports.loginWithGoogle = loginWithGoogle;
