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

/**
 * The connection string. Prefers DATABASE_URL, but falls back to POSTGRES_URL
 * so the Vercel–Neon integration (which sets both) works out of the box.
 */
export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url && url.trim().length > 0 ? url.trim() : undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Cache the client on globalThis so Next's dev HMR doesn't open a new pool per
// reload (a common source of "too many connections" in development).
const globalForDb = globalThis as unknown as {
  __ypSql?: ReturnType<typeof postgres>;
  __ypDb?: Database;
};

export function getDb(): Database {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "No database URL. Set DATABASE_URL (or POSTGRES_URL) to use the database-backed repositories.",
    );
  }
  if (!globalForDb.__ypDb) {
    const sql = postgres(url, {
      max: 10,
      prepare: false,
    });
    globalForDb.__ypSql = sql;
    globalForDb.__ypDb = drizzle(sql, { schema });
  }
  return globalForDb.__ypDb;
}

export { schema };
