// import { PrismaClient } from "@prisma/client";
// import { getClient, setClient } from "./tenantCache.js";

// // Initialize control DB with Accelerate URL
// const controlDb = new PrismaClient({
//   datasources: {
//     db: {
//       url: process.env.MAIN_DATABASE_URL // Must start with prisma:// or prisma+postgres://
//     }
//   },
//   log: ['query', 'info', 'warn', 'error']
// });

// // Verify connection and model availability
// (async () => {
//   try {
//     await controlDb.$connect();
//     console.log("✅ Connected to control DB via Accelerate");

//     // Debug: Check available models
//     const models = Object.keys(controlDb).filter(k => !k.startsWith('_') && !k.startsWith('$'));

//     // Fallback to raw query if model not found
//     if (!('project' in controlDb)) {
//       const projects = await controlDb.$queryRaw`SELECT * FROM "Project" LIMIT 1`;
//     } else {
//       const project = await controlDb.project.findFirst();
//     }

//   } catch (error) {
//     console.error("❌ Control DB initialization failed:", error);
//     process.exit(1);
//   }
// })();

// export async function getPrismaClient(projectId) {
//   try {
//     // First try standard model access
//     let project;
//     if ('project' in controlDb) {
//       project = await controlDb.project.findUnique({ where: { id: projectId } });
//     } else {
//       // Fallback to raw query
//       [project] = await controlDb.$queryRaw`SELECT * FROM "Project" WHERE id = ${projectId}`;
//     }

//     if (!project) throw new Error(`Project ${projectId} not found`);

//     // Create tenant client with Accelerate URL
//     const tenantClient = new PrismaClient({
//       datasources: {
//         db: { url: project.dbUrl } // Should be prisma+postgres:// URL
//       }
//     });

//     await tenantClient.$connect();
//     setClient(projectId, tenantClient);

//     return tenantClient;

//   } catch (error) {
//     console.error("Error in getPrismaClient:", {
//       message: error.message,
//       projectId,
//       stack: error.stack
//     });
//     throw error;
//   }
// }

// // Keep other exports (getPrismaClientFromCache, getJwtSecret)

// export async function getJwtSecret(projectId) {
//   try {
//     console.log("🔑 Fetching JWT secret for project:", projectId);

//     // First try standard model access
//     let project;
//     if ('project' in controlDb) {
//       project = await controlDb.project.findUnique({
//         where: { id: projectId }
//       });
//     } else {
//       // Fallback to raw query
//       [project] = await controlDb.$queryRaw`
//         SELECT * FROM "Project" WHERE id = ${projectId}
//       `;
//     }

//     if (!project) {
//       console.error("❌ Project not found when fetching JWT secret:", projectId);
//       throw new Error("Invalid project ID");
//     }

//     if (!project.jwtSecret) {
//       console.error("❌ JWT secret missing for project:", projectId);
//       throw new Error("JWT secret not configured for project");
//     }

//     return project.jwtSecret;
//   } catch (error) {
//     console.error("🚨 Error in getJwtSecret:", {
//       projectId,
//       error: error.message,
//       stack: error.stack
//     });
//     throw error;
//   }
// }



import { PrismaClient } from "@prisma/client";
import { getClient, setClient } from "./tenantCache.js";

// Initialize with Railway and Accelerate support
const controlDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.MAIN_DATABASE_URL
    }
  },
  __internal: {
    engine: {
      endpoint: process.env.MAIN_DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error']
});

// Connection verification with model check
async function initializePrisma() {
  try {
    await controlDb.$connect();
    console.log("✅ Connected to control DB");

    // Verify models via raw query if needed
    const tables = await controlDb.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Database tables:", tables);

    // Force model availability
    if (!('project' in controlDb)) {
      const [project] = await controlDb.$queryRaw`SELECT * FROM "Project" LIMIT 1`;
      if (!project) {
        console.warn("⚠️ Project table exists but model not generated");
      }
    }
  } catch (error) {
    console.error("❌ Prisma initialization failed:", error);
    process.exit(1);
  }
}

// Initialize immediately
await initializePrisma();

export async function getPrismaClient(projectId) {
  try {
    // Railway-optimized query with Accelerate fallback
    const [project] = await controlDb.$queryRaw`
      SELECT * FROM "Project" WHERE id = ${projectId} LIMIT 1
    `;

    if (!project) {
      console.error("Project not found:", projectId);
      throw new Error("Invalid project ID");
    }

    // Handle both direct and Accelerate URLs
    const tenantUrl = project.dbUrl.includes('prisma://') 
      ? project.dbUrl 
      : `prisma+postgres://${project.dbUrl.replace(/^postgres:\/\//, '')}`;

    const tenantClient = new PrismaClient({
      datasources: {
        db: { url: tenantUrl }
      },
      __internal: {
        engine: {
          endpoint: tenantUrl
        }
      }
    });

    await tenantClient.$connect();
    setClient(projectId, tenantClient);

    return tenantClient;
  } catch (error) {
    console.error("Prisma Client Error:", {
      projectId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function getJwtSecret(projectId) {
  try {
    // Direct raw query for reliability
    const [project] = await controlDb.$queryRaw`
      SELECT * FROM "Project" WHERE id = ${projectId} LIMIT 1
    `;

    if (!project) {
      console.error("Project not found:", projectId);
      throw new Error("Invalid project ID");
    }

    if (!project.jwtSecret) {
      console.error("Missing JWT secret for project:", projectId);
      throw new Error("JWT secret not configured");
    }

    return project.jwtSecret;
  } catch (error) {
    console.error("JWT Secret Error:", {
      projectId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}