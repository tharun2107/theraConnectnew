import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const prisma = global.__prisma__ || new PrismaClient({
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

export default prisma;


