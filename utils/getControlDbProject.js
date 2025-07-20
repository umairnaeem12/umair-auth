// utils/getControlDbProject.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.MAIN_DATABASE_URL, // your main control DB
});

export async function getProjectById(projectId) {
  const res = await pool.query(
    "SELECT * FROM \"Project\" WHERE id = $1 LIMIT 1",
    [projectId]
  );

  if (res.rows.length === 0) throw new Error("Invalid project ID");

  return res.rows[0]; // includes dbUrl and jwtSecret
}
