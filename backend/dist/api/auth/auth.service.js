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
exports.login = exports.changePassword = exports.registerAdmin = exports.registerTherapist = exports.registerParent = void 0;
const client_1 = require("@prisma/client");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const prisma = new client_1.PrismaClient();
const registerParent = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, phone } = input;
    const existingUser = yield prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User with this email already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Pre-checks to surface conflicts as 409
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
    const existingUser = yield prisma.user.findUnique({ where: { email } });
    if (existingUser)
        throw new Error('User with this email already exists');
    const hashedPassword = yield (0, password_1.hashPassword)(password);
    return prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: { email, password: hashedPassword, role: client_1.Role.ADMIN },
        });
        yield tx.adminProfile.create({ data: { userId: user.id, name } });
        return user;
    }));
});
exports.registerAdmin = registerAdmin;
const changePassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, currentPassword, newPassword }) {
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('No account found with this email');
    const isValid = yield (0, password_1.comparePassword)(currentPassword, user.password);
    if (!isValid)
        throw new Error('Current password is incorrect');
    const hashed = yield (0, password_1.hashPassword)(newPassword);
    yield prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    return { message: 'Password updated successfully' };
});
exports.changePassword = changePassword;
const login = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = input;
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid email or password');
    const isPasswordValid = yield (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid)
        throw new Error('Invalid email or password');
    const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
    const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
    return { user: userWithoutPassword, token };
});
exports.login = login;
