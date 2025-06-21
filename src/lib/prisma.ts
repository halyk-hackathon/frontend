import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
const globalForPrisma = isNode ? global : window; // fallback to window if not in Node

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production' && isNode) globalForPrisma.prisma = prisma;