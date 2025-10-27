// Prisma Client Singleton
// Note: Prisma Client will be generated when you run: pnpm db:generate
// For now, we export a placeholder that will be replaced after generation

let prisma: any;

if (process.env.NODE_ENV === 'production') {
  // @ts-ignore
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  if (!globalForPrisma.prisma) {
    // @ts-ignore
    try {
      const { PrismaClient } = require('@prisma/client');
      globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      });
    } catch (error) {
      // Prisma Client not generated yet
      console.warn('Prisma Client not generated. Run: pnpm db:generate');
      globalForPrisma.prisma = null;
    }
  }

  prisma = globalForPrisma.prisma;
}

export { prisma };
