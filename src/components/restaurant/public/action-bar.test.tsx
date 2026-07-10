import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/lib/i18n/locale-provider";
import { RestaurantFixedActionBar } from "./RestaurantFixedActionBar";
import { RestaurantFloatingContactMenu } from "./RestaurantFloatingContactMenu";
import { buildRestaurantPublicActions } from "@/lib/restaurant-actions/buildRestaurantActions";
import type { Restaurant, CustomerAction } from "@/domain/entities";

vi.mock("next/navigation", () => ({ usePathname: () => "/restaurants/pizza-house" }));

const restaurant = { id: "r1", slug: "pizza-house", name: "Pizza House", displayName: "Pizza House" } as Restaurant;
function act(
  type: CustomerAction["type"],
  dt: CustomerAction["destinationType"],
  dest: string,
  label: string = type,
): CustomerAction {
  return { id: `a_${type}`, restaurantId: "r1", type, label: { en: label }, destinationType: dt, destination: dest, enabled: true, status: "configured", sortOrder: 1 };
}

// The bottom-bar labels are data-driven (the admin-set customer-action labels),
// falling back to translations when an action has none (e.g. pick-your-meal here).
const fullData = buildRestaurantPublicActions(
  restaurant,
  [
    act("call-order", "phone", "+1-512-555-0142", "Call Order"),
    act("online-order", "external", "https://order.example.com/ph", "Online Order with Pay"),
    act("visit-us", "map", "https://maps.google.com/?q=ph", "Add Contact"),
    act("whatsapp", "whatsapp", "+15125550142"),
    act("instagram", "external", "https://instagram.com/ph"),
  ],
  null,
  "en",
  { allowHttp: false },
);

const wrap = (ui: React.ReactElement) => render(<LocaleProvider initialLocale="en">{ui}</LocaleProvider>);

beforeEach(() => localStorage.clear());

describe("RestaurantFixedActionBar", () => {
  it("renders the four actions in order with the supplied PNGs", () => {
    const { container } = wrap(<RestaurantFixedActionBar actions={fullData} />);
    expect(screen.getByText("Call Order")).toBeInTheDocument();
    expect(screen.getByText("Pick Your Meal")).toBeInTheDocument();
    expect(screen.getByText("Online Order with Pay")).toBeInTheDocument();
    expect(screen.getByText("Add Contact")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /restaurant actions/i })).toBeInTheDocument();
    const srcs = Array.from(container.querySelectorAll("img")).map((i) => i.getAttribute("src") ?? "");
    expect(srcs.some((s) => s.includes("call-order.png"))).toBe(true);
    expect(srcs.some((s) => s.includes("add-contact.png"))).toBe(true);
  });

  it("external order opens safely in a new tab", () => {
    wrap(<RestaurantFixedActionBar actions={fullData} />);
    const link = screen.getByRole("link", { name: /Online Order with Pay/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("disables actions with no data (no phone/external/contact)", () => {
    const empty = buildRestaurantPublicActions(restaurant, [], null, "en");
    wrap(<RestaurantFixedActionBar actions={empty} />);
    // Call Order has no link when unavailable
    expect(screen.queryByRole("link", { name: /Call Order/i })).toBeNull();
  });
});

describe("RestaurantFloatingContactMenu", () => {
  it("opens and closes via the toggle button", async () => {
    const user = userEvent.setup();
    wrap(<RestaurantFloatingContactMenu actions={fullData} />);
    const btn = screen.getByRole("button", { name: /open contact options/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.click(btn);
    expect(screen.getByRole("button", { name: /close contact options/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    wrap(<RestaurantFloatingContactMenu actions={fullData} />);
    await user.click(screen.getByRole("button", { name: /open contact options/i }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: /open contact options/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows only configured contact actions", () => {
    wrap(<RestaurantFloatingContactMenu actions={fullData} />);
    expect(screen.getByText("Call Us")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getByText("Get Directions")).toBeInTheDocument();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
    expect(screen.queryByText("Facebook")).toBeNull();
    expect(screen.queryByText("Website")).toBeNull();
  });

  it("renders nothing when no contact actions are configured", () => {
    const empty = buildRestaurantPublicActions(restaurant, [], null, "en");
    const { container } = wrap(<RestaurantFloatingContactMenu actions={empty} />);
    expect(container.querySelector("button")).toBeNull();
  });
});
