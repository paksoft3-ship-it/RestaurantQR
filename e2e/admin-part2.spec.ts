import { test, expect, type Page } from "@playwright/test";

const EMAIL = "admin@yourplatform.test";
const PASSWORD = "demo1234";
const RID = "rest_pizza_house";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });
}

const restaurantRoutes = [
  "contact-location",
  "opening-hours",
  "menu",
  "media",
  "customer-actions",
  "qr-codes",
  "nfc-products",
  "campaigns",
  "analytics",
  "page-builder",
];

const globalRoutes = ["/admin/website", "/admin/enquiries", "/admin/platform-settings", "/admin/team", "/admin/audit-log"];

test.describe("Part 2 admin restaurant editors", () => {
  for (const seg of restaurantRoutes) {
    test(`renders ${seg}`, async ({ page }) => {
      await login(page);
      const res = await page.goto(`/admin/restaurants/${RID}/${seg}`);
      expect(res?.ok(), `${seg} should respond ok`).toBeTruthy();
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }
});

test.describe("Part 2 global platform pages", () => {
  for (const route of globalRoutes) {
    test(`renders ${route}`, async ({ page }) => {
      await login(page);
      const res = await page.goto(route);
      expect(res?.ok(), `${route} should respond ok`).toBeTruthy();
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }

  test("campaign editor (new) renders a form", async ({ page }) => {
    await login(page);
    await page.goto(`/admin/restaurants/${RID}/campaigns/new`);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /save|create/i }).first()).toBeVisible();
  });
});
