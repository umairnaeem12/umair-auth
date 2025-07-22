import { PrismaClient } from '@prisma/client';

export const globalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MAIN_DATABASE_URL,
    },
  },
});
