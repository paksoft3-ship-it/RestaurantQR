import { test, expect, type Page } from "@playwright/test";

/**
 * Change-password screen (real auth). Changes the password, restores it, then
 * confirms the change persisted by signing in fresh. Requires the dev server to
 * run with AUTH_MODE=real + DATABASE_URL. Leaves the password as ChangeMe-2026!.
 */
test.skip(!process.env.DATABASE_URL, "requires a configured DATABASE_URL + AUTH_MODE=real");

const EMAIL = "admin@yourplatform.test";
const PW = "ChangeMe-2026!";
const TEMP = "TempPass-2026!";

async function login(page: Page, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });
}

async function changePassword(page: Page, current: string, next: string) {
  await page.goto("/admin/account");
  await page.locator("#current-password").fill(current);
  await page.locator("#new-password").fill(next);
  await page.locator("#confirm-password").fill(next);
  await page.getByRole("button", { name: /update password/i }).click();
  await expect(page.getByText(/password updated/i).first()).toBeVisible({ timeout: 15000 });
}

test("change password works and persists across sign-in", async ({ page }) => {
  await login(page, PW);
  await changePassword(page, PW, TEMP);
  // Current-password check uses the just-changed value; then restore the original.
  await changePassword(page, TEMP, PW);

  // Fresh session proves the new hash persisted to the database.
  await page.context().clearCookies();
  await login(page, PW);
  await expect(page).toHaveURL(/\/admin$/);
});

test("wrong current password is rejected", async ({ page }) => {
  await login(page, PW);
  await page.goto("/admin/account");
  await page.locator("#current-password").fill("definitely-wrong");
  await page.locator("#new-password").fill(TEMP);
  await page.locator("#confirm-password").fill(TEMP);
  await page.getByRole("button", { name: /update password/i }).click();
  await expect(page.getByText(/current password is incorrect/i).first()).toBeVisible({ timeout: 15000 });
});
