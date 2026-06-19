import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, mockAuthEnabled, warnIfMisconfigured } from "./config";
import { decodeSession, encodeSession, type SessionPayload } from "./session";
import { getRepositories } from "@/data/repositories";
import { permissionsForRole, type Permission, type Role } from "@/domain/permissions";
import type { AdminUser } from "@/domain/entities";
import { routes } from "@/lib/routes";

export type SignInResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "inactive" | "locked" | "unauthorized" | "not-configured" };

/**
 * Authentication abstraction. Backed by a development-only mock adapter today;
 * the same surface can later wrap a real authentication provider.
 */

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(authConfig.cookieName)?.value;
  const session = decodeSession(token);
  if (!session) return null;
  const user = await getRepositories().auth.findByEmail(session.email);
  if (!user || user.status !== "active") return null;
  return user;
}

export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getCurrentAdminUser();
  if (!user) redirect(routes.admin.login());
  return user;
}

export function hasPermission(user: AdminUser | null, permission: Permission): boolean {
  if (!user) return false;
  const granted = user.permissions.length > 0 ? user.permissions : permissionsForRole(user.role);
  return granted.includes(permission);
}

export async function requirePermission(permission: Permission): Promise<AdminUser> {
  const user = await requireAdminUser();
  if (!hasPermission(user, permission)) redirect(routes.admin.dashboard());
  return user;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  warnIfMisconfigured();

  if (!mockAuthEnabled) {
    // Mock auth never silently works in production.
    return { ok: false, reason: "not-configured" };
  }

  const matchesMock =
    email.toLowerCase() === authConfig.mockEmail.toLowerCase() &&
    authConfig.mockPassword.length > 0 &&
    password === authConfig.mockPassword;

  if (!matchesMock) return { ok: false, reason: "invalid" };

  const user = await getRepositories().auth.findByEmail(authConfig.mockEmail);
  if (!user) return { ok: false, reason: "invalid" };
  if (user.status === "locked") return { ok: false, reason: "locked" };
  if (user.status === "inactive") return { ok: false, reason: "inactive" };

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as Role,
    exp: Math.floor(Date.now() / 1000) + authConfig.sessionMaxAgeSeconds,
  };

  const store = await cookies();
  store.set(authConfig.cookieName, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: authConfig.isProduction,
    path: "/",
    maxAge: authConfig.sessionMaxAgeSeconds,
  });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(authConfig.cookieName);
}

export { mockAuthEnabled };
