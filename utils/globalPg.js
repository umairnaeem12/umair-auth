import pkg from 'pg';
const { Pool } = pkg;

export const globalPg = new Pool({
  connectionString: process.env.MAIN_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
