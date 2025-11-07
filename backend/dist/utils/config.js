"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    jwt: {
        secret: process.env.TZOKEN_SECRET || 'therabeesecret',
        expiresIn: process.env.TOKEN_EXPIRES_IN || '1d',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || ''
    }
};
