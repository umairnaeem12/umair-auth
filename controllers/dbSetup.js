import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { pushPrismaSchemaToDatabase } from "../utils/setupPrismaSchema.js";

// Initialize with dual connection strategy
const prisma = new PrismaClient({
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

const initSchema = z.object({
  dbUrl: z.string().url("Invalid DB URL"),
  jwtSecret: z.string().min(10, "JWT secret too short"),
});

export async function dataBaseSetup(req, res) {
  const result = initSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { dbUrl, jwtSecret } = result.data;
  const projectId = "proj_" + crypto.randomBytes(8).toString("hex");

  try {
    // 1. First try standard Prisma operation
    let createdProject;
    try {
      createdProject = await prisma.project.create({
        data: {
          id: projectId,
          dbUrl,
          jwtSecret,
        },
      });
    } catch (createError) {
      console.warn("Standard create failed, trying raw query:", createError);
      
      // 2. Fallback to raw SQL query
      await prisma.$executeRaw`
        INSERT INTO "Project" (id, "dbUrl", "jwtSecret", "createdAt")
        VALUES (${projectId}, ${dbUrl}, ${jwtSecret}, NOW())
      `;
      
      // 3. Verify creation
      createdProject = await prisma.$queryRaw`
        SELECT * FROM "Project" WHERE id = ${projectId}
      `;
    }

    if (!createdProject) {
      throw new Error("Failed to create project in both standard and raw modes");
    }

    // Push schema to the new database
    await pushPrismaSchemaToDatabase(dbUrl, projectId);

    res.status(201).json({
      message: "Project initialized successfully",
      projectId,
      dbUrl: createdProject.dbUrl,
      jwtSecret: createdProject.jwtSecret ? "*****" : undefined
    });

  } catch (err) {
    console.error("Database setup error:", {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    res.status(500).json({ 
      error: "Project initialization failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}