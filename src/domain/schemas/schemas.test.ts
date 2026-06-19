import { describe, it, expect } from "vitest";
import {
  isValidSlug,
  slugSchema,
  hexColorSchema,
  brandColorsSchema,
  enquirySchema,
  loginSchema,
} from "./index";

describe("slugSchema", () => {
  it("accepts valid slugs", () => {
    expect(isValidSlug("pizza-house")).toBe(true);
    expect(isValidSlug("green-bowl-2")).toBe(true);
  });
  it("rejects invalid slugs", () => {
    expect(isValidSlug("Pizza House")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("double--hyphen")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
    expect(slugSchema.safeParse("UPPER").success).toBe(false);
  });
});

describe("hexColorSchema / brandColorsSchema", () => {
  it("accepts 3 and 6 digit hex", () => {
    expect(hexColorSchema.safeParse("#fff").success).toBe(true);
    expect(hexColorSchema.safeParse("#F04424").success).toBe(true);
  });
  it("rejects non-hex", () => {
    expect(hexColorSchema.safeParse("red").success).toBe(false);
    expect(hexColorSchema.safeParse("#12").success).toBe(false);
  });
  it("validates a full brand palette", () => {
    const ok = brandColorsSchema.safeParse({
      primary: "#F04424",
      primaryDark: "#C9341A",
      accent: "#FFC533",
      surface: "#F8FAFC",
      text: "#111827",
    });
    expect(ok.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires email + password", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });
});

describe("enquirySchema", () => {
  const base = {
    restaurantName: "Sunset Diner",
    contactPerson: "Maria",
    email: "maria@example.com",
    enquiryType: "quote" as const,
    preferredContactMethod: "email" as const,
    consent: true,
  };
  it("accepts a valid enquiry", () => {
    expect(enquirySchema.safeParse(base).success).toBe(true);
  });
  it("requires consent", () => {
    expect(enquirySchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });
  it("rejects a filled honeypot", () => {
    expect(enquirySchema.safeParse({ ...base, company: "bot" }).success).toBe(false);
  });
  it("rejects an invalid email", () => {
    expect(enquirySchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });
});
