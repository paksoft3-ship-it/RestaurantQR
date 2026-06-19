import { describe, it, expect } from "vitest";
import { parsePrice, parseVariantPrices, detectOcrConfusion } from "./price-normalization";

describe("parsePrice", () => {
  it("parses a bare integer with default currency", () => {
    const p = parsePrice("240", { defaultCurrency: "TRY" });
    expect(p?.amount).toBe(240);
    expect(p?.currency).toBe("TRY");
  });

  it("detects currency from symbols and codes", () => {
    expect(parsePrice("240 ₺")?.currency).toBe("TRY");
    expect(parsePrice("₺240")?.currency).toBe("TRY");
    expect(parsePrice("240 TL")?.currency).toBe("TRY");
    expect(parsePrice("€12,50")?.currency).toBe("EUR");
    expect(parsePrice("$8.00")?.currency).toBe("USD");
  });

  it("handles comma decimals and thousands separators", () => {
    expect(parsePrice("240,00 ₺")?.amount).toBe(240);
    expect(parsePrice("1.250,00 ₺")?.amount).toBe(1250);
    expect(parsePrice("240.00")?.amount).toBe(240);
    expect(parsePrice("240,-")?.amount).toBe(240);
  });

  it("lowers confidence when currency is missing", () => {
    const withCur = parsePrice("240 ₺");
    const without = parsePrice("240");
    expect(without!.confidence).toBeLessThan(withCur!.confidence);
  });

  it("lowers confidence for multi-value (variant) strings", () => {
    const single = parsePrice("240 ₺");
    const multi = parsePrice("240 / 310 ₺");
    expect(multi!.amount).toBe(240);
    expect(multi!.confidence).toBeLessThan(single!.confidence);
  });

  it("returns null for non-price text", () => {
    expect(parsePrice("Fresh basil")).toBeNull();
    expect(parsePrice("")).toBeNull();
  });
});

describe("parseVariantPrices", () => {
  it("extracts labelled variant prices", () => {
    const v = parseVariantPrices("Medium 240 Large 310", { defaultCurrency: "TRY" });
    expect(v).toHaveLength(2);
    expect(v[0]).toMatchObject({ label: "Medium", amount: 240, currency: "TRY" });
    expect(v[1]).toMatchObject({ label: "Large", amount: 310 });
  });

  it("handles short labels like M / L", () => {
    const v = parseVariantPrices("M 240 L 310");
    expect(v.map((x) => x.amount)).toEqual([240, 310]);
  });
});

describe("detectOcrConfusion", () => {
  it("flags letter/number confusion", () => {
    expect(detectOcrConfusion("I50").suspect).toBe(true);
    expect(detectOcrConfusion("240").suspect).toBe(false);
  });
});
