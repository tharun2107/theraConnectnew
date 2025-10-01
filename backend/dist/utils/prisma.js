"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = global.__prisma__ || new client_1.PrismaClient({
    datasources: {
        db: {
        // rely on DATABASE_URL; ensure sslmode=require in .env for Neon
        },
    },
    log: ['error', 'warn'],
    errorFormat: 'minimal',
});
if (process.env.NODE_ENV !== 'production') {
    global.__prisma__ = prisma;
}
exports.default = prisma;
