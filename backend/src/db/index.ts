import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import env from "../config/env";
import * as schema from "./schema";

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

function getCleanConnectionString(rawUrl: string): string {
  // Strip query parameters that cause self-signed certificate warnings with cloud poolers
  return rawUrl.split("?")[0];
}

const dbUrl = env.DATABASE_URL && env.DATABASE_URL.trim() !== "" ? env.DATABASE_URL : process.env.DATABASE_URL;

if (dbUrl && dbUrl.trim() !== "") {
  try {
    const connStr = getCleanConnectionString(dbUrl);
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
    });
    db = drizzle(pool, { schema });
  } catch (err) {
    console.warn("Database client initialization deferred:", err);
  }
}

/**
 * Checks whether PostgreSQL is reachable by running a simple 'SELECT 1'.
 */
export async function checkDbConnection(): Promise<boolean> {
  const activeUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (!activeUrl || activeUrl.trim() === "") {
    return false;
  }
  try {
    if (!pool) {
      const connStr = getCleanConnectionString(activeUrl);
      pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
      });
      db = drizzle(pool, { schema });
    }
    const result = await pool.query("SELECT 1 as ok");
    return result.rowCount ? result.rowCount > 0 : true;
  } catch (error) {
    console.error("Database connection check failed:", error);
    return false;
  }
}

export { pool, db };
export default db;
