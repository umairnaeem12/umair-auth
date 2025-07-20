import { PrismaClient } from "@prisma/client";
import { getClient, setClient } from "./tenantCache.js";

// Initialize control DB with Accelerate URL
const controlDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MAIN_DATABASE_URL // Must start with prisma:// or prisma+postgres://
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

// Verify connection and model availability
(async () => {
  try {
    await controlDb.$connect();
    console.log("✅ Connected to control DB via Accelerate");

    // Debug: Check available models
    const models = Object.keys(controlDb).filter(k => !k.startsWith('_') && !k.startsWith('$'));

    // Fallback to raw query if model not found
    if (!('project' in controlDb)) {
      const projects = await controlDb.$queryRaw`SELECT * FROM "Project" LIMIT 1`;
    } else {
      const project = await controlDb.project.findFirst();
    }

  } catch (error) {
    console.error("❌ Control DB initialization failed:", error);
    process.exit(1);
  }
})();

export async function getPrismaClient(projectId) {
  try {
    // First try standard model access
    let project;
    if ('project' in controlDb) {
      project = await controlDb.project.findUnique({ where: { id: projectId } });
    } else {
      // Fallback to raw query
      [project] = await controlDb.$queryRaw`SELECT * FROM "Project" WHERE id = ${projectId}`;
    }

    if (!project) throw new Error(`Project ${projectId} not found`);

    console.log("🚀 ~ getPrismaClient ~ project:", project)
    if (!project?.dbUrl) {
      throw new Error("❌ dbUrl not found for project");
    }

    // Create tenant client with Accelerate URL
    const tenantClient = new PrismaClient({
      datasources: {
        db: { url: project.dbUrl },
      },
      log: ['query', 'info', 'warn', 'error'],
    });

    await tenantClient.$connect();
    setClient(projectId, tenantClient);

    return tenantClient;

  } catch (error) {
    console.error("Error in getPrismaClient:", {
      message: error.message,
      projectId,
      stack: error.stack
    });
    throw error;
  }
  console.log("🚀 ~ getPrismaClient ~ project:", project)
  console.log("🚀 ~ getPrismaClient ~ project:", project)
  console.log("🚀 ~ getPrismaClient ~ project:", project)
}

// Keep other exports (getPrismaClientFromCache, getJwtSecret)

export async function getJwtSecret(projectId) {
  try {
    console.log("🔑 Fetching JWT secret for project:", projectId);

    // First try standard model access
    let project;
    if ('project' in controlDb) {
      project = await controlDb.project.findUnique({
        where: { id: projectId }
      });
    } else {
      // Fallback to raw query
      [project] = await controlDb.$queryRaw`
        SELECT * FROM "Project" WHERE id = ${projectId}
      `;
    }

    if (!project) {
      console.error("❌ Project not found when fetching JWT secret:", projectId);
      throw new Error("Invalid project ID");
    }

    if (!project.jwtSecret) {
      console.error("❌ JWT secret missing for project:", projectId);
      throw new Error("JWT secret not configured for project");
    }

    return project.jwtSecret;
  } catch (error) {
    console.error("🚨 Error in getJwtSecret:", {
      projectId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}