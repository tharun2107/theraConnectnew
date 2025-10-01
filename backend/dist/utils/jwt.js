"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const signJwt = (payload) => {
    const options = {
        expiresIn: config_1.config.jwt.expiresIn, // assert type
    };
    return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, options);
};
exports.signJwt = signJwt;
const verifyJwt = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        return decoded;
    }
    catch (_a) {
        return null;
    }
};
exports.verifyJwt = verifyJwt;
