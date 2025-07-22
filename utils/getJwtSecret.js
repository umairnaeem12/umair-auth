import { PrismaClient } from '@prisma/client';

const controlPrisma = new PrismaClient({
  datasources: {
    db: { url: process.env.MAIN_DATABASE_URL },
  },
});

export async function getJwtSecret(projectId) {
  const project = await controlPrisma.project.findUnique({ where: { id: projectId } });
  if (!project || !project.jwtSecret) {
    throw new Error("JWT secret not found for project");
  }
  return project.jwtSecret;
}
