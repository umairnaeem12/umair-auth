import { PrismaClient } from '@prisma/client';

const clientCache = {};

export async function getPrismaClient(projectId, dbUrl) {
  if (clientCache[projectId]) {
    return clientCache[projectId];
  }

  const client = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
  });

  await client.$connect();
  clientCache[projectId] = client;

  return client;
}
