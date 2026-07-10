"use server";
import { eq } from "drizzle-orm";
import { requireAdminUser } from "@/lib/auth";
import { authConfig } from "@/lib/auth/config";
import { getRepositories } from "@/data/repositories";
import { getDb, isDatabaseConfigured, schema } from "@/data/db/client";
import { hashPassword } from "@/lib/auth/password";

export type ChangePasswordResult = { ok: true } | { ok: false; error: string };

/**
 * Change the signed-in admin's password. Real auth only (AUTH_MODE=real): it
 * re-verifies the current password against the stored scrypt hash, then writes
 * a new hash for that user.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await requireAdminUser();

  if (authConfig.authMode !== "real" || !isDatabaseConfigured()) {
    return {
      ok: false,
      error: "Password change is available only with real auth (AUTH_MODE=real).",
    };
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }
  if (newPassword === currentPassword) {
    return { ok: false, error: "New password must be different from the current one." };
  }

  const verified = await getRepositories().auth.verifyCredentials(user.email, currentPassword);
  if (!verified) return { ok: false, error: "Your current password is incorrect." };

  const passwordHash = await hashPassword(newPassword);
  await getDb().update(schema.adminUsers).set({ passwordHash }).where(eq(schema.adminUsers.id, user.id));
  return { ok: true };
}
