// utils/getPrismaClient.js
import { PrismaClient } from "@prisma/client";

const clientCache = {};

export async function getPrismaClient(projectId, dbUrl) {
  if (clientCache[projectId]) return clientCache[projectId];

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  });

  await prisma.$connect();
  clientCache[projectId] = prisma;

  return prisma;
}
