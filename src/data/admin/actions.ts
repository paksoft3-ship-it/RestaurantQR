"use server";
import { revalidatePath } from "next/cache";
import { getDb, isDatabaseConfigured } from "@/data/db/client";
import { requireAdminUser } from "@/lib/auth";
import { applyPersist, loadSnapshot } from "./persist-core";
import type { AdminSnapshot, PersistOp } from "./types";

/**
 * Public (ISR-cached) pages that render each admin-editable content collection.
 * After a write we revalidate them so edits appear immediately instead of
 * waiting for the ~30s revalidate window. (Restaurant pages are already dynamic.)
 */
const CONTENT_REVALIDATE_PATHS: Partial<Record<string, string[]>> = {
  websiteContent: ["/", "/about", "/features"],
  templates: ["/templates"],
  faq: ["/faq"],
  packages: ["/packages"],
  legal: ["/privacy", "/cookies", "/terms", "/campaign-terms"],
};

function revalidateForOp(op: PersistOp): void {
  const paths = new Set<string>();
  if ("collection" in op) {
    for (const p of CONTENT_REVALIDATE_PATHS[op.collection] ?? []) paths.add(p);
  }
  if (op.kind === "restaurant.create" || op.kind === "restaurant.update") {
    paths.add("/restaurant-examples");
  }
  for (const p of paths) revalidatePath(p);
}

/**
 * Auth-gated server actions backing the admin store when a database is
 * configured. These are the ONLY network-exposed entry points; the actual
 * database logic lives in `persist-core` (auth-free, db-injected, testable).
 * All mutations require an authenticated admin user and write directly to
 * Postgres, making the database the source of truth for admin edits.
 */

/** Load a full snapshot of admin-editable data from the database. */
export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  await requireAdminUser();
  return loadSnapshot(getDb());
}

/** Persist a single admin store change to the database (auth-gated). */
export async function adminPersist(op: PersistOp): Promise<void> {
  await requireAdminUser();
  if (!isDatabaseConfigured()) return;
  await applyPersist(getDb(), op);
  // Refresh any public pages that render this content so edits go live at once.
  revalidateForOp(op);
}
