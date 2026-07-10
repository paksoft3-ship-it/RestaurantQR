import { test, expect } from "@playwright/test";

/**
 * Proves the admin write path is truly database-backed:
 * edit a customer action in the admin editor → it persists to Postgres →
 * the PUBLIC page (which reads the DB server-side, independent of the admin
 * client cache) reflects the change. Then it reverts to "Add Contact".
 */

const EMAIL = "admin@yourplatform.test";
const PASSWORD = "demo1234";
const MARKER = "Contact Us E2E";
const ORIGINAL = "Add Contact";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });
}

async function setVisitLabel(page: import("@playwright/test").Page, value: string) {
  await page.goto("/admin/restaurants/rest_pizza_house/customer-actions");
  const input = page.locator("#label-act_visit");
  await expect(input).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(800);
  // Set the value via the native setter + input event — the canonical way to
  // drive a React controlled input from automation so onChange fires reliably.
  await input.evaluate((el, val) => {
    const proto = window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    setter?.call(el, val);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await expect(input).toHaveValue(value);
  await page.getByRole("button", { name: /save draft/i }).click();
  await expect(page.getByText(/customer actions draft saved/i).first()).toBeVisible({ timeout: 20000 });
  // Let the fire-and-forget persist server action flush to the database.
  await page.waitForTimeout(2500);
}

// This flow only holds when a real database backs the app (admin writes and the
// public read path then share one source of truth). In localStorage demo mode
// they are separate stores, so skip.
test.skip(!process.env.DATABASE_URL, "requires a configured DATABASE_URL");

test("admin edit persists to DB and shows on the public page", async ({ page }) => {
  await login(page);

  // 1) Edit the label in admin and save.
  await setVisitLabel(page, MARKER);

  // 2) The public page reads the DB directly (server-side) — it must reflect it.
  await page.goto("/restaurants/pizza-house");
  await expect(page.getByText(MARKER).first()).toBeVisible({ timeout: 20000 });

  // 3) Revert to the client's requested label; the marker must disappear.
  await setVisitLabel(page, ORIGINAL);
  await page.goto("/restaurants/pizza-house");
  await expect(page.getByText(MARKER)).toHaveCount(0);
  await expect(page.getByText(ORIGINAL).first()).toBeVisible({ timeout: 20000 });
});
