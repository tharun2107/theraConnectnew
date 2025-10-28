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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication invalid: No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyJwt)(token);
    if (!decoded) {
        res.status(401).json({ message: "Authentication invalid: Invalid token." });
        return;
    }
    const userExists = yield prisma.user.findUnique({
        where: { id: decoded.userId }
    });
    if (!userExists) {
        res.status(401).json({ message: "Authentication invalid: User not found." });
        return;
    }
    req.user = userExists;
    next();
});
exports.authenticate = authenticate;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!(user === null || user === void 0 ? void 0 : user.role)) {
            res.status(403).json({ message: "Forbidden: Role not available." });
            return;
        }
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ message: "Forbidden: Access denied." });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
