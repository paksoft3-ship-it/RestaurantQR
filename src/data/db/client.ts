import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Lazy Postgres connection shared across the server runtime.
 *
 * The app runs against a real database whenever `DATABASE_URL` is set; when it
 * is absent, callers fall back to the in-memory mock repositories, so local dev
 * and demo deployments keep working with no database.
 */

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Cache the client on globalThis so Next's dev HMR doesn't open a new pool per
// reload (a common source of "too many connections" in development).
const globalForDb = globalThis as unknown as {
  __ypSql?: ReturnType<typeof postgres>;
  __ypDb?: Database;
};

export function getDb(): Database {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not set. Configure it to use the database-backed repositories.",
    );
  }
  if (!globalForDb.__ypDb) {
    const sql = postgres(process.env.DATABASE_URL as string, {
      max: 10,
      prepare: false,
    });
    globalForDb.__ypSql = sql;
    globalForDb.__ypDb = drizzle(sql, { schema });
  }
  return globalForDb.__ypDb;
}

export { schema };
