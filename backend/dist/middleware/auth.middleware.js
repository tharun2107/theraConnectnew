"use strict";
// src/middleware/auth.middleware.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
// You still need UserRole for the authorize function to see it
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication invalid: No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyJwt)(token); // This is type UserRole (or JwtPayload)
    if (!decoded) {
        return res.status(401).json({ message: 'Authentication invalid: Invalid token.' });
    }
    // Note: You can skip this DB check if you trust your JWT.
    // The token *already* has the role.
    const userExists = yield prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!userExists) {
        return res.status(401).json({ message: 'Authentication invalid: User not found.' });
    }
    req.currentUser = decoded; // This will now be type-safe
    next();
});
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        // req.user is now correctly typed as UserRole
        if (!((_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.role)) {
            return res.status(403).json({ message: 'Forbidden: Role not available.' });
        }
        if (!allowedRoles.includes(req.currentUser.role)) {
            return res.status(403).json({ message: `Forbidden: Access denied.` });
        }
        next();
    };
};
exports.authorize = authorize;
