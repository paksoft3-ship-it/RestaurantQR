import "server-only";
import { repositories } from "./mock";
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
 * Single accessor for server-side data. Swap the implementation here when a
 * real backend is connected — page components never import a concrete repo.
 */
export function getRepositories(): RepositoryBundle {
  return repositories;
}

export { repositories };
