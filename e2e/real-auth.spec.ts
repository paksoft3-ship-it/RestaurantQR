import { test, expect } from "@playwright/test";

/**
 * Real auth (AUTH_MODE=real): login verifies a per-user scrypt password hash
 * stored in the database. The old shared mock password must NOT work.
 * Requires the dev server to run with AUTH_MODE=real + DATABASE_URL.
 */
test.skip(!process.env.DATABASE_URL, "requires a configured DATABASE_URL + AUTH_MODE=real");

const EMAIL = "admin@yourplatform.test";
const REAL_PASSWORD = "ChangeMe-2026!";

test("real auth accepts the correct hashed password", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(REAL_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });
});

test("real auth rejects the old mock password", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill("demo1234");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText(/invalid/i).first()).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/admin\/login/);
});
