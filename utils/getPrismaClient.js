import { PrismaClient } from "@prisma/client";
import { getClient, setClient } from "./tenantCache.js";
import path from "path";
import { pathToFileURL } from "url";
import { existsSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);


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
    // 1. Fetch the project from control DB
    let project;
    if ("project" in controlDb) {
      project = await controlDb.project.findUnique({ where: { id: projectId } });
    } else {
      [project] = await controlDb.$queryRaw`SELECT * FROM "Project" WHERE id = ${projectId}`;
    }

    if (!project) throw new Error(`❌ Project ${projectId} not found`);
    if (!project?.dbUrl) throw new Error("❌ dbUrl not found for project");

    console.log("🚀 ~ getPrismaClient ~ project:", project);

    // 2. Resolve the dynamic Prisma client path
    const generatedPath = `./prisma/tenants/generated-${projectId}`;
    if (!existsSync(generatedPath)) {
      await execAsync(`npx prisma generate --schema=${schemaPath}`);
    }

    // 3. Dynamically import the generated Prisma client
    const { PrismaClient: TenantClient } = await import(moduleUrl);
    const tenantClient = new TenantClient();

    await tenantClient.$connect();

    // 4. Cache and return the client
    setClient(projectId, tenantClient);
    return tenantClient;

  } catch (error) {
    console.error("❌ Error in getPrismaClient:", {
      message: error.message,
      projectId,
      stack: error.stack,
    });
    throw error;
  }
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