import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

// Create Prisma client with connection pool configuration
const prisma = global.__prisma__ || new PrismaClient({
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
const gracefulShutdown = async () => {
  console.log('[Prisma] Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

if (process.env.NODE_ENV !== 'production') {
  global.__prisma__ = prisma;
}

export default prisma;


