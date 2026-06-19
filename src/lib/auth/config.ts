/** Auth configuration and the production safety guard for mock auth. */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Mock auth is only ever active in non-production when explicitly enabled.
 * It can never silently work in production.
 */
export const mockAuthEnabled = !isProduction && process.env.ENABLE_MOCK_AUTH === "true";

export const authConfig = {
  isProduction,
  mockAuthEnabled,
  cookieName: "yp_admin_session",
  sessionMaxAgeSeconds: 60 * 60 * 8, // 8 hours
  mockEmail: process.env.MOCK_ADMIN_EMAIL ?? "admin@yourplatform.test",
  mockPassword: process.env.MOCK_ADMIN_PASSWORD ?? (isProduction ? "" : "demo1234"),
  secret: process.env.AUTH_SECRET ?? (isProduction ? "" : "dev-insecure-secret-change-me"),
};

/** Emit a one-time development warning when mock credentials are missing. */
let warned = false;
export function warnIfMisconfigured(): void {
  if (warned || isProduction) return;
  warned = true;
  if (mockAuthEnabled && (!process.env.MOCK_ADMIN_EMAIL || !process.env.MOCK_ADMIN_PASSWORD)) {
    console.warn(
      "[auth] Mock auth is enabled with default demo credentials. Set MOCK_ADMIN_EMAIL / MOCK_ADMIN_PASSWORD in .env.local to override.",
    );
  }
  if (mockAuthEnabled && !process.env.AUTH_SECRET) {
    console.warn("[auth] AUTH_SECRET is not set; using an insecure development secret.");
  }
}
