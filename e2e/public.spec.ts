import { test, expect } from "@playwright/test";

const marketingRoutes = [
  "/",
  "/how-it-works",
  "/features",
  "/qr-nfc-products",
  "/restaurant-examples",
  "/templates",
  "/packages",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/cookies",
  "/terms",
  "/campaign-terms",
];

test.describe("public marketing", () => {
  for (const route of marketingRoutes) {
    test(`loads ${route} without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      const res = await page.goto(route);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("h1").first()).toBeVisible();
      expect(errors, errors.join("\n")).toHaveLength(0);
    });
  }

  test("primary navigation moves between pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Features", exact: true }).first().click();
    await expect(page).toHaveURL(/\/features$/);
  });

  test("cookie preferences persist", async ({ page }) => {
    await page.goto("/cookies");
    // Reject optional via the notice or the preferences panel.
    const reject = page.getByRole("button", { name: /reject optional/i }).first();
    await expect(reject).toBeVisible();
    await reject.click();
    // Poll localStorage to allow the persistence write to flush.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("yp_cookie_consent")), { timeout: 5000 })
      .toContain('"decided":true');
  });
});

test.describe("restaurant experience", () => {
  test("Pizza House homepage loads with the four actions", async ({ page }) => {
    await page.goto("/restaurants/pizza-house");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText(/Call Order/i).first()).toBeVisible();
    await expect(page.getByText(/Visit Us/i).first()).toBeVisible();
  });

  test("digital menu and product detail open", async ({ page }) => {
    await page.goto("/restaurants/pizza-house/menu");
    await expect(page.locator("h1").first()).toBeVisible();
    await page.goto("/restaurants/pizza-house/menu/margherita-pizza");
    await expect(page.getByText(/Margherita/i).first()).toBeVisible();
  });

  test("fixed action bar + floating contact menu (restaurant only)", async ({ page }) => {
    await page.goto("/restaurants/pizza-house");
    const bar = page.getByRole("navigation", { name: /restaurant actions/i });
    await expect(bar).toBeVisible();
    await expect(bar.getByText("Call Order")).toBeVisible();
    await expect(bar.getByText("Add Contact")).toBeVisible();
    // Floating menu opens and closes with Escape
    const plus = page.getByRole("button", { name: /open contact options/i });
    await plus.click();
    await expect(page.getByText("WhatsApp")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /open contact options/i })).toBeVisible();
  });

  test("action bar does NOT appear on marketing pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: /restaurant actions/i })).toHaveCount(0);
  });
});
