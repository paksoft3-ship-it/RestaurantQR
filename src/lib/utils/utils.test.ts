import { describe, it, expect } from "vitest";
import { slugify, formatPrice, formatDate, titleCase } from "./index";

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Pizza House")).toBe("pizza-house");
    expect(slugify("  Café Mimoza!  ")).toBe("cafe-mimoza");
    expect(slugify("Green__Bowl--2")).toBe("green-bowl-2");
  });
});

describe("formatPrice", () => {
  it("formats currency", () => {
    expect(formatPrice(12.5, "USD", "en-US")).toBe("$12.50");
  });
  it("returns a dash for missing values", () => {
    expect(formatPrice(null)).toBe("—");
    expect(formatPrice(undefined)).toBe("—");
  });
});

describe("formatDate", () => {
  it("returns a dash for missing/invalid", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
  it("formats an ISO date", () => {
    expect(formatDate("2026-06-01T00:00:00.000Z", "en-US")).toContain("2026");
  });
});

describe("titleCase", () => {
  it("title-cases kebab/snake", () => {
    expect(titleCase("modern-fast-food")).toBe("Modern Fast Food");
    expect(titleCase("warm_mediterranean")).toBe("Warm Mediterranean");
  });
});
