import { describe, expect, it } from "vitest";
import { parseOcrToResult } from "./worker/ocr-parser";

// A representative slice of the real Tesseract output from a dense, scanned,
// two-column American grinder menu (the kind users actually upload).
const SAMPLE_PAGE = `Uppetizers & Sides

Fried Mozzarella 6 pcs.......010.25 Fried Calamari............0eee 10.25
Side of Meatballs ............scceee 8.75 Served with sour cream
Onion Rings Battered... 8.99 Sample Special 3 cach... 12.49

Regular Grinders
Sml 8" Giant 16" Pita Pocket
Hamburger ............ 10.49....... 14.50 .........10.49
Cheeseburger ...... 10.49....... 14.50. ...... 10.49`;

function parse(text: string) {
  return parseOcrToResult({
    importId: "imp_test",
    restaurantId: "rest_test",
    fileName: "menu.pdf",
    pages: [text],
    pageCount: 1,
    pdfType: "scanned",
    currency: "USD",
    defaultLanguage: "en",
  });
}

describe("parseOcrToResult", () => {
  it("detects category headings and assigns priced items to them", () => {
    const result = parse(SAMPLE_PAGE);
    const catNames = result.categories.map((c) => c.name.value);
    expect(catNames).toContain("Uppetizers & Sides");
    expect(catNames).toContain("Regular Grinders");
  });

  it("splits two merged columns into separate products with their own prices", () => {
    const result = parse(SAMPLE_PAGE);
    const appetizers = result.categories.find((c) => c.name.value.includes("Uppetizers"));
    const names = appetizers?.items.map((i) => i.name.value) ?? [];
    // Both halves of the merged "Fried Mozzarella ... Fried Calamari ..." line.
    expect(names.some((n) => n.includes("Fried Mozzarella"))).toBe(true);
    expect(names.some((n) => n.includes("Fried Calamari"))).toBe(true);
    const mozz = appetizers?.items.find((i) => i.name.value.includes("Fried Mozzarella"));
    expect(mozz?.basePrice?.amount).toBe(10.25);
  });

  it("treats trailing size-column prices as variants, not phantom products", () => {
    const result = parse(SAMPLE_PAGE);
    const grinders = result.categories.find((c) => c.name.value === "Regular Grinders");
    const burger = grinders?.items.find((i) => i.name.value.includes("Hamburger"));
    expect(burger?.basePrice?.amount).toBe(10.49);
    // 14.50 + 10.49 become labelled variants of the same product.
    expect(burger?.variants.map((v) => v.price.amount)).toEqual([14.5, 10.49]);
    expect(burger?.variants[0]?.name).toBe('Giant 16"');
  });

  it("never auto-selects high confidence and always flags an OCR review warning", () => {
    const result = parse(SAMPLE_PAGE);
    expect(result.warnings.some((w) => w.code === "OCR_LOW_CONFIDENCE")).toBe(true);
    expect(result.statistics.highConfidenceFields).toBe(0);
    expect(result.statistics.productCount).toBeGreaterThan(0);
  });

  it("raises a blocking warning when nothing priced is found", () => {
    const result = parse("Just some prose with no prices at all.\nThank you for visiting.");
    expect(result.statistics.productCount).toBe(0);
    expect(result.warnings.some((w) => w.severity === "BLOCKING")).toBe(true);
  });
});
