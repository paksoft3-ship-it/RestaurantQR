import { describe, it, expect } from "vitest";
import {
  buildRestaurantPublicActions,
  buildFixedActions,
  buildFloatingActions,
} from "./buildRestaurantActions";
import { normalizePhone, safeWebUrl, buildWhatsappUrl, normalizeWhatsappDigits } from "./urlSafety";
import type { Restaurant, CustomerAction, RestaurantLocation } from "@/domain/entities";

const restaurant = { id: "r1", slug: "pizza-house", name: "Pizza House", displayName: "Pizza House" } as Restaurant;

function action(type: CustomerAction["type"], destinationType: CustomerAction["destinationType"], destination: string | null): CustomerAction {
  return { id: `a_${type}`, restaurantId: "r1", type, label: { en: type }, destinationType, destination, enabled: true, status: "configured", sortOrder: 1 };
}

const location = { id: "l1", restaurantId: "r1", locationName: "Main", country: "US", city: "Austin", district: "Downtown", address: "120 Congress Ave", postalCode: "78701", latitude: null, longitude: null, mapUrl: null, timezone: null, publicLabel: null, internalNotes: null } as RestaurantLocation;

describe("urlSafety", () => {
  it("normalizes phone numbers for tel:", () => {
    expect(normalizePhone("+1 (512) 555-0142")).toBe("+15125550142");
    expect(normalizePhone("0512 555 01 42")).toBe("05125550142");
    expect(normalizePhone("123")).toBeNull();
  });
  it("rejects unsafe protocols and bad URLs", () => {
    expect(safeWebUrl("javascript:alert(1)")).toBeNull();
    expect(safeWebUrl("data:text/html,x")).toBeNull();
    expect(safeWebUrl("not a url")).toBeNull();
    expect(safeWebUrl("http://x.com")).toBeNull(); // http blocked by default
    expect(safeWebUrl("http://x.com", { allowHttp: true })).toContain("http://x.com");
    expect(safeWebUrl("https://order.example.com/p")).toBe("https://order.example.com/p");
  });
  it("builds wa.me with digits only", () => {
    expect(normalizeWhatsappDigits("+1 (512) 555-0142")).toBe("15125550142");
    expect(buildWhatsappUrl("+1 512 555 0142")).toBe("https://wa.me/15125550142");
    expect(buildWhatsappUrl("https://wa.me/15125550142")).toBe("https://wa.me/15125550142");
    expect(buildWhatsappUrl(null)).toBeNull();
  });
});

describe("buildRestaurantPublicActions", () => {
  const data = buildRestaurantPublicActions(
    restaurant,
    [
      action("call-order", "phone", "+1-512-555-0142"),
      action("online-order", "external", "https://order.example.com/ph"),
      action("visit-us", "map", "https://maps.google.com/?q=ph"),
      action("whatsapp", "whatsapp", "+15125550142"),
      action("instagram", "external", "https://instagram.com/ph"),
    ],
    location,
    "en",
    { allowHttp: false },
  );

  it("resolves safe destinations + menu url", () => {
    expect(data.orderPhone).toBe("+15125550142");
    expect(data.menuUrl).toBe("/restaurants/pizza-house/menu");
    expect(data.externalOrderingUrl).toBe("https://order.example.com/ph");
    expect(data.whatsappUrl).toBe("https://wa.me/15125550142");
    expect(data.directionsUrl).toContain("maps.google.com");
    expect(data.contactCardUrl).toBe("/api/restaurants/pizza-house/contact-card");
    expect(data.hasContactData).toBe(true);
  });

  it("hides facebook/website (no data) by design", () => {
    expect(data.facebookUrl).toBeNull();
    expect(data.websiteUrl).toBeNull();
  });

  it("builds 4 ordered fixed actions using the supplied PNGs", () => {
    const fixed = buildFixedActions(data);
    expect(fixed.map((a) => a.type)).toEqual(["CALL_ORDER", "OPEN_MENU", "EXTERNAL_ORDER", "ADD_CONTACT"]);
    expect(fixed[0].iconSrc).toBe("/images/restaurant-actions/call-order.png");
    expect(fixed[1].iconSrc).toBe("/images/restaurant-actions/pick-your-meal.png");
    expect(fixed[2].iconSrc).toBe("/images/restaurant-actions/online-order-pay.png");
    expect(fixed[3].iconSrc).toBe("/images/restaurant-actions/add-contact.png");
  });

  it("only includes configured floating actions", () => {
    const floating = buildFloatingActions(data);
    const keys = floating.map((f) => f.key);
    expect(keys).toContain("call");
    expect(keys).toContain("whatsapp");
    expect(keys).toContain("directions");
    expect(keys).toContain("instagram");
    expect(keys).not.toContain("facebook");
    expect(keys).not.toContain("website");
  });
});

describe("missing data", () => {
  it("disables call + external + add-contact when nothing configured", () => {
    const data = buildRestaurantPublicActions(restaurant, [], null, "en");
    const fixed = buildFixedActions(data);
    expect(fixed[0].available).toBe(false); // call
    expect(fixed[0].href).toBeNull();
    expect(fixed[1].available).toBe(true); // menu always available
    expect(fixed[2].available).toBe(false); // external
    expect(fixed[3].available).toBe(false); // add contact
    expect(buildFloatingActions(data)).toHaveLength(0);
  });
});
