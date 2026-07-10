import path from "node:path";
import { test, expect } from "@playwright/test";

/**
 * Menu PDF upload: admin uploads a PDF → it is stored in the DB and served at
 * /api/restaurants/[id]/menu-pdf → the public menu page shows a "View menu
 * (PDF)" link. Requires DATABASE_URL. Cleans up after itself.
 */
test.skip(!process.env.DATABASE_URL, "requires a configured DATABASE_URL");

const EMAIL = "admin@yourplatform.test";
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "demo1234";
const PDF = path.join(process.cwd(), "public", "MENU", "1TEST.pdf");

test("upload menu PDF → stored → public link + served", async ({ page }) => {
  // Log in.
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });

  // Upload the PDF on the restaurant menu page.
  await page.goto("/admin/restaurants/rest_pizza_house/menu");
  await page.locator('input[type="file"]').setInputFiles(PDF);
  await expect(page.getByText(/menu pdf uploaded/i).first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/1TEST\.pdf/i).first()).toBeVisible();

  // Public page shows the link and the file is served as a PDF.
  await page.goto("/restaurants/pizza-house/menu");
  await expect(page.getByRole("link", { name: /view menu \(pdf\)/i })).toBeVisible({ timeout: 20000 });
  const served = await page.request.get("/api/restaurants/rest_pizza_house/menu-pdf");
  expect(served.status()).toBe(200);
  expect(served.headers()["content-type"]).toContain("application/pdf");

  // Clean up: remove the uploaded PDF.
  const del = await page.request.delete("/api/restaurants/rest_pizza_house/menu-pdf");
  expect(del.ok()).toBeTruthy();
  const gone = await page.request.get("/api/restaurants/rest_pizza_house/menu-pdf");
  expect(gone.status()).toBe(404);
});
