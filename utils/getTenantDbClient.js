// utils/getTenantDbClient.js
import { globalPg } from "./globalPgClient.js";
import pkg from 'pg';
const { Pool } = pkg;

export async function getTenantDb(projectId) {
  const result = await globalPg.query(
    `SELECT db_url, jwt_secret FROM "Project" WHERE id = $1`,
    [projectId]
  );

  if (result.rows.length === 0) {
    throw new Error("Project not found");
  }

  const { db_url, jwt_secret } = result.rows[0];

  const tenantDb = new Pool({
    connectionString: db_url,
    ssl: { rejectUnauthorized: false },
  });

  return { tenantDb, jwtSecret: jwt_secret };
}
