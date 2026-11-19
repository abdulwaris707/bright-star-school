import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import env from "../config/env";

let sqlClient: NeonQueryFunction<boolean, boolean> | null = null;
let db: NeonHttpDatabase | null = null;

if (env.DATABASE_URL && env.DATABASE_URL.trim() !== "") {
  try {
    sqlClient = neon(env.DATABASE_URL);
    db = drizzle({ client: sqlClient });
  } catch (err) {
    console.warn("Neon database client initialization deferred:", err);
  }
}

/**
 * Checks whether Neon Postgres is reachable by running a simple 'SELECT 1'.
 */
export async function checkDbConnection(): Promise<boolean> {
  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === "") {
    return false;
  }
  try {
    const runner = sqlClient || neon(env.DATABASE_URL);
    const result = await runner`SELECT 1 as ok`;
    if (Array.isArray(result)) {
      return result.length > 0;
    }
    return Boolean(result);
  } catch (error) {
    return false;
  }
}

export { sqlClient as sql, db };
export default db;
