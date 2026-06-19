import { describe, it, expect } from "vitest";
import { buildDeterministicResult } from "./worker/deterministic-extractor";
import { validateImportResult } from "./validation";
import { importResultSchema, type ImportConfig } from "@/domain/menu-import";
import type { MenuCategory, MenuProduct } from "@/domain/entities";

const config: ImportConfig = {
  defaultLanguage: "en",
  currency: "TRY",
  existingMenuBehavior: "new-draft",
  imageHandling: "manual-review",
  extractionMode: "maximum-accuracy",
};

const categories: MenuCategory[] = [
  { id: "c1", restaurantId: "r1", localizedName: { en: "Pizzas" }, localizedDescription: null, sortOrder: 1, status: "active", image: null },
];

const products: MenuProduct[] = [
  { id: "p1", categoryId: "c1", restaurantId: "r1", slug: "margherita", localizedName: { en: "Margherita" }, localizedDescription: { en: "Tomato, mozzarella, basil" }, price: 240, currency: "TRY", image: null, availability: "available", variants: [{ id: "v1", label: "Large", priceModifier: 70 }], dietaryLabels: ["Vegetarian"], allergenNote: "Gluten", featured: true, sortOrder: 1 },
  { id: "p2", categoryId: "c1", restaurantId: "r1", slug: "pepperoni", localizedName: { en: "Pepperoni" }, localizedDescription: { en: "Pepperoni and cheese" }, price: 280, currency: "TRY", image: null, availability: "available", variants: [], dietaryLabels: [], allergenNote: null, featured: false, sortOrder: 2 },
];

function build() {
  return buildDeterministicResult({
    importId: "imp_test",
    restaurantId: "r1",
    fileName: "menu.pdf",
    config,
    restaurantName: "Pizza House",
    categories,
    products,
  });
}

describe("deterministic extractor", () => {
  it("produces a schema-valid result", () => {
    const result = build();
    expect(importResultSchema.safeParse(result).success).toBe(true);
  });

  it("is deterministic (same input → same confidences)", () => {
    const a = build();
    const b = build();
    expect(a.categories[0].items[0].confidence).toBe(b.categories[0].items[0].confidence);
  });

  it("maps real menu items into candidates with prices", () => {
    const result = build();
    const item = result.categories[0].items[0];
    expect(item.name.value).toBe("Margherita");
    expect(item.basePrice?.amount).toBe(240);
    expect(item.basePrice?.currency).toBe("TRY");
    expect(item.variants[0]).toMatchObject({ name: "Large" });
  });

  it("generates review-worthy warnings (not a perfect extraction)", () => {
    const result = build();
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("produces an unassigned candidate for the unassigned workflow", () => {
    const result = build();
    expect(result.unassignedCandidates.length).toBeGreaterThan(0);
  });
});

describe("validateImportResult", () => {
  it("passes a valid result with selected products and no blocking warnings", () => {
    const outcome = validateImportResult(build());
    expect(outcome.ok).toBe(true);
    expect(outcome.selectedProducts).toBeGreaterThan(0);
  });

  it("blocks when an unresolved BLOCKING warning exists", () => {
    const result = build();
    result.warnings.push({
      id: "wb", entityType: "price", entityCandidateId: "p1", field: "basePrice",
      severity: "BLOCKING", code: "PRICE_CURRENCY_MISSING", message: "missing", resolved: false,
    });
    const outcome = validateImportResult(result);
    expect(outcome.ok).toBe(false);
    expect(outcome.unresolvedBlocking).toHaveLength(1);
  });
});
