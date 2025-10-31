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
const client_1 = require("@prisma/client");
// Create Prisma client with connection pool configuration
const prisma = global.__prisma__ || new client_1.PrismaClient({
    datasources: {
        db: {
        // rely on DATABASE_URL; ensure sslmode=require in .env for Neon
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'minimal',
});
// Note: Connection pooling is handled automatically by Prisma
// Ensure DATABASE_URL is set correctly in your .env file
// If you see "Connection closed" errors, check your DATABASE_URL and database server status
// Graceful shutdown handling
const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('[Prisma] Closing database connection...');
    yield prisma.$disconnect();
    process.exit(0);
});
process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
if (process.env.NODE_ENV !== 'production') {
    global.__prisma__ = prisma;
}
exports.default = prisma;
