import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit config for generating and applying SQL migrations.
 * Requires DATABASE_URL in the environment (see .env.local / .env.example).
 */
export default defineConfig({
  schema: "./src/data/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/yourplatform",
  },
  strict: true,
  verbose: true,
});
