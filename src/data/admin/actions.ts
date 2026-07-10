"use server";
import { getDb, isDatabaseConfigured } from "@/data/db/client";
import { requireAdminUser } from "@/lib/auth";
import { applyPersist, loadSnapshot } from "./persist-core";
import type { AdminSnapshot, PersistOp } from "./types";

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
}
