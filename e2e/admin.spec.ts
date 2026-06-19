import { test, expect } from "@playwright/test";

const EMAIL = "admin@yourplatform.test";
const PASSWORD = "demo1234";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).first().fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 20000 });
}

test.describe("admin auth", () => {
  test("protected route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login states authorized-team-only and rejects invalid credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByText(/team access only/i).first()).toBeVisible();
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).first().fill("nope");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i).first()).toBeVisible();
  });

  test("login succeeds with mock credentials and dashboard loads", async ({ page }) => {
    await login(page);
    await expect(page.locator("h1").first()).toBeVisible();
  });
});

test.describe("admin restaurants", () => {
  test("list loads and search works", async ({ page }) => {
    await login(page);
    await page.goto("/admin/restaurants");
    await expect(page.getByText(/Pizza House/i).first()).toBeVisible();
    const search = page.getByRole("searchbox").or(page.getByPlaceholder(/search/i)).first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill("anatolia");
      await expect(page.getByText(/Anatolia/i).first()).toBeVisible();
    }
  });

  test("add restaurant validates required fields", async ({ page }) => {
    await login(page);
    await page.goto("/admin/restaurants/new");
    const create = page.getByRole("button", { name: /create restaurant/i }).first();
    if (await create.isVisible().catch(() => false)) {
      await create.click();
      await expect(page.getByText(/required/i).first()).toBeVisible();
    }
  });
});

test.describe("admin noindex", () => {
  test("admin login is noindex", async ({ page }) => {
    const res = await page.goto("/admin/login");
    expect(res?.headers()["x-robots-tag"] ?? "").toContain("noindex");
  });
});
