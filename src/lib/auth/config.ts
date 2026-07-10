/** Auth configuration and the production safety guard for mock auth. */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Demo deployments can explicitly opt into mock auth in production by setting
 * `ALLOW_MOCK_AUTH_IN_PRODUCTION=true`. This is a deliberate env-gated choice —
 * mock auth still never enables itself silently. Use only for demo deployments
 * (the admin operates on per-browser demo data; no real backend is exposed).
 */
const allowMockInProduction = process.env.ALLOW_MOCK_AUTH_IN_PRODUCTION === "true";

/**
 * Real auth verifies per-user scrypt password hashes stored in the database.
 * Enabled with `AUTH_MODE=real` (requires DATABASE_URL + AUTH_SECRET). When
 * real auth is on, mock auth is always off.
 */
export const authMode: "real" | "mock" = process.env.AUTH_MODE === "real" ? "real" : "mock";

/**
 * Mock auth is active in non-production when `ENABLE_MOCK_AUTH=true`, OR in
 * production only when `ALLOW_MOCK_AUTH_IN_PRODUCTION=true` is explicitly set —
 * and never when real auth is enabled.
 */
export const mockAuthEnabled =
  authMode !== "real" &&
  ((!isProduction && process.env.ENABLE_MOCK_AUTH === "true") ||
    (isProduction && allowMockInProduction));

/** Whether to fall back to demo credentials/secret (dev, or opted-in demo prod). */
const useDemoDefaults = !isProduction || allowMockInProduction;

export const authConfig = {
  isProduction,
  authMode,
  mockAuthEnabled,
  allowMockInProduction,
  cookieName: "yp_admin_session",
  sessionMaxAgeSeconds: 60 * 60 * 8, // 8 hours
  mockEmail: process.env.MOCK_ADMIN_EMAIL ?? "admin@yourplatform.test",
  mockPassword: process.env.MOCK_ADMIN_PASSWORD ?? (useDemoDefaults ? "demo1234" : ""),
  secret:
    process.env.AUTH_SECRET ??
    (useDemoDefaults ? "yp-demo-insecure-secret-change-me" : ""),
};

/** Emit a one-time development warning when mock credentials are missing. */
let warned = false;
export function warnIfMisconfigured(): void {
  if (warned) return;
  warned = true;
  if (mockAuthEnabled && !process.env.AUTH_SECRET) {
    console.warn("[auth] AUTH_SECRET is not set; using an insecure demo secret. Set AUTH_SECRET.");
  }
  if (isProduction && allowMockInProduction) {
    console.warn(
      "[auth] Mock auth is ENABLED IN PRODUCTION via ALLOW_MOCK_AUTH_IN_PRODUCTION. Use only for demo deployments.",
    );
  }
}
