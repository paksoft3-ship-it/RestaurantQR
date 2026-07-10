import "server-only";
import { repositories } from "./mock";
import { dbRepositories } from "./db";
import { isDatabaseConfigured } from "@/data/db/client";
import type { RepositoryBundle } from "@/domain/repositories";

// Re-export commonly used contract types so pages can import them alongside the
// repository accessor.
export type {
  AnalyticsSnapshot,
  Paginated,
  RestaurantListQuery,
  RepositoryBundle,
} from "@/domain/repositories";

/**
 * Single accessor for server-side data.
 *
 * When `DATABASE_URL` is configured the app reads/writes a real Postgres
 * database; otherwise it falls back to the in-memory seed mock so local dev and
 * demo deployments keep working with no database. Page components never import
 * a concrete repo — they always go through this accessor.
 */
export function getRepositories(): RepositoryBundle {
  return isDatabaseConfigured() ? dbRepositories : repositories;
}

export { repositories };
