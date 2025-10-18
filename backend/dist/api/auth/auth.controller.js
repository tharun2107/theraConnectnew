"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.googleOAuthHandler = exports.changePasswordHandler = exports.loginHandler = exports.registerAdminHandler = exports.registerTherapistHandler = exports.registerParentHandler = void 0;
const authService = __importStar(require("./auth.service"));
const jwt_1 = require("../../utils/jwt");
const auth_validation_1 = require("./auth.validation");
const handleServiceError = (res, error) => {
    var _a;
    const isConflict = (_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('exists');
    return res.status(isConflict ? 409 : 500).json({ message: error.message });
};
const registerParentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.registerParent(req.body);
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
        res.status(201).json({ message: 'Parent registered successfully', user: userWithoutPassword, token });
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
exports.registerParentHandler = registerParentHandler;
const registerTherapistHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.registerTherapist(req.body);
        const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json({ message: 'Therapist registered successfully', user: userWithoutPassword, token });
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
exports.registerTherapistHandler = registerTherapistHandler;
const registerAdminHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.registerAdmin(req.body);
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        const token = (0, jwt_1.signJwt)({ userId: user.id, role: user.role });
        res.status(201).json({ message: 'Admin registered successfully', user: userWithoutPassword, token });
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
exports.registerAdminHandler = registerAdminHandler;
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.login(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
});
exports.loginHandler = loginHandler;
const changePasswordHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield authService.changePassword(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        const status = /incorrect|No account/i.test(error.message) ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
});
exports.changePasswordHandler = changePasswordHandler;
const googleOAuthHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Basic debug without logging tokens
        console.log('[AUTH][GOOGLE] Incoming request to /auth/google');
        const parsed = auth_validation_1.googleOAuthSchema.parse({ body: req.body });
        console.log('[AUTH][GOOGLE] Payload received (token length):', (_a = parsed.body.idToken) === null || _a === void 0 ? void 0 : _a.length);
        const result = yield authService.loginWithGoogle(parsed.body);
        console.log('[AUTH][GOOGLE] Login success for user', (_b = result === null || result === void 0 ? void 0 : result.user) === null || _b === void 0 ? void 0 : _b.email);
        res.status(200).json(result);
    }
    catch (error) {
        const status = (error === null || error === void 0 ? void 0 : error.issues) ? 400 : 401;
        console.error('[AUTH][GOOGLE][ERROR]', (error === null || error === void 0 ? void 0 : error.message) || error);
        res.status(status).json({ message: error.message || 'Google login failed' });
    }
});
exports.googleOAuthHandler = googleOAuthHandler;
