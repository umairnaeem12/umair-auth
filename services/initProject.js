// services/initProject.js
import { globalPg } from "../utils/globalPgClient.js";
import { v4 as uuidv4 } from "uuid";
import pkg from "pg";
const { Pool } = pkg;

export async function initProject(req, res) {
  const { name, dbUrl, jwtSecret } = req.body;

  if (!name || !dbUrl || !jwtSecret) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const projectId = uuidv4();

    // 1. Save in main DB
    await globalPg.query(
      `INSERT INTO "Project" (id, name, db_url, jwt_secret) VALUES ($1, $2, $3, $4)`,
      [projectId, name, dbUrl, jwtSecret]
    );

    // 2. Create users table in tenant DB
    const tenantPool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });

    await tenantPool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        otp_code TEXT,
        otp_expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await tenantPool.end();

    return res.status(201).json({
      message: "Project initialized successfully",
      projectId,
    });
  } catch (error) {
    console.error("❌ Failed to init project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
