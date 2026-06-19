import { describe, it, expect } from "vitest";
import {
  consentReducer,
  defaultChoices,
  initialConsent,
  CONSENT_VERSION,
} from "./consent";

describe("consentReducer", () => {
  it("defaults all optional categories to off, essential on", () => {
    const c = defaultChoices();
    expect(c.essential).toBe(true);
    expect(c.preferences).toBe(false);
    expect(c.analytics).toBe(false);
    expect(c.marketing).toBe(false);
  });

  it("accept-all enables every category and marks decided", () => {
    const next = consentReducer(initialConsent(), { type: "accept-all" });
    expect(next.decided).toBe(true);
    expect(next.choices).toEqual({
      essential: true,
      preferences: true,
      analytics: true,
      marketing: true,
    });
    expect(next.updatedAt).not.toBeNull();
    expect(next.version).toBe(CONSENT_VERSION);
  });

  it("reject-optional keeps only essential", () => {
    const next = consentReducer(initialConsent(), { type: "reject-optional" });
    expect(next.decided).toBe(true);
    expect(next.choices).toEqual(defaultChoices());
  });

  it("save merges partial choices and forces essential on", () => {
    const next = consentReducer(initialConsent(), {
      type: "save",
      choices: { analytics: true },
    });
    expect(next.choices.analytics).toBe(true);
    expect(next.choices.essential).toBe(true);
    expect(next.choices.marketing).toBe(false);
    expect(next.decided).toBe(true);
  });

  it("toggle never disables essential", () => {
    const next = consentReducer(initialConsent(), { type: "toggle", category: "essential" });
    expect(next.choices.essential).toBe(true);
  });

  it("toggle flips an optional category", () => {
    const next = consentReducer(initialConsent(), { type: "toggle", category: "analytics" });
    expect(next.choices.analytics).toBe(true);
  });

  it("reset returns to undecided defaults", () => {
    const decided = consentReducer(initialConsent(), { type: "accept-all" });
    const reset = consentReducer(decided, { type: "reset" });
    expect(reset.decided).toBe(false);
    expect(reset.choices).toEqual(defaultChoices());
  });
});
