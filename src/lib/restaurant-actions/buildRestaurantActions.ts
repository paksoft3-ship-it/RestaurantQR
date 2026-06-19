import type { CustomerAction, Restaurant, RestaurantLocation } from "@/domain/entities";
import type { CustomerActionType } from "@/domain/enums";
import type { Locale } from "@/lib/i18n/locales";
import { routes } from "@/lib/routes";
import {
  type FixedRestaurantAction,
  type FloatingContactAction,
  type RestaurantPublicActionData,
} from "./restaurantActionTypes";
import { buildWhatsappUrl, normalizePhone, safeWebUrl } from "./urlSafety";

const ICON_BASE = "/images/restaurant-actions";
export const ACTION_ICONS = {
  callOrder: `${ICON_BASE}/call-order.png`,
  pickYourMeal: `${ICON_BASE}/pick-your-meal.png`,
  onlineOrderPay: `${ICON_BASE}/online-order-pay.png`,
  addContact: `${ICON_BASE}/add-contact.png`,
} as const;

function destinationFor(actions: CustomerAction[], type: CustomerActionType): string | null {
  const match = actions.find((a) => a.enabled && a.type === type && a.destination?.trim());
  return match?.destination?.trim() ?? null;
}

function addressLine(location: RestaurantLocation | null): string | null {
  if (!location) return null;
  const joined = [location.address, location.district, location.city, location.postalCode, location.country]
    .filter(Boolean)
    .join(", ");
  return joined || null;
}

/**
 * Normalize a restaurant's public details into a serializable action view model.
 * Validates URLs, resolves phone fallbacks, and excludes unavailable / unsafe
 * destinations. Never fabricates contact data. Pure + typed.
 */
export function buildRestaurantPublicActions(
  restaurant: Restaurant,
  actions: CustomerAction[],
  location: RestaurantLocation | null,
  locale: Locale,
  options: { allowHttp?: boolean } = {},
): RestaurantPublicActionData {
  const allowHttp = options.allowHttp ?? process.env.NODE_ENV !== "production";
  const slug = restaurant.slug;

  const orderPhone = normalizePhone(destinationFor(actions, "call-order"));
  const externalOrderingUrl = safeWebUrl(destinationFor(actions, "online-order"), { allowHttp });
  const directionsUrl = safeWebUrl(destinationFor(actions, "visit-us"), { allowHttp });
  const whatsappUrl = buildWhatsappUrl(destinationFor(actions, "whatsapp"));
  const instagramUrl = safeWebUrl(destinationFor(actions, "instagram"), { allowHttp });
  const publicEmail = destinationFor(actions, "email");

  const hasContactData = Boolean(orderPhone || publicEmail || addressLine(location));

  return {
    restaurantId: restaurant.id,
    restaurantSlug: slug,
    restaurantName: restaurant.displayName || restaurant.name,
    locale,
    orderPhone,
    primaryPhone: orderPhone,
    menuUrl: routes.restaurant.menu(slug),
    externalOrderingUrl,
    contactCardUrl: hasContactData ? `/api/restaurants/${slug}/contact-card` : null,
    hasContactData,
    whatsappUrl,
    directionsUrl,
    instagramUrl,
    facebookUrl: null, // no facebook field in the data model — hidden by design
    websiteUrl: null, // no dedicated public website field — hidden by design
    publicEmail,
  };
}

/** Build the four ordered fixed bottom-bar actions. */
export function buildFixedActions(data: RestaurantPublicActionData): FixedRestaurantAction[] {
  return [
    {
      type: "CALL_ORDER",
      iconSrc: ACTION_ICONS.callOrder,
      href: data.orderPhone ? `tel:${data.orderPhone}` : null,
      available: Boolean(data.orderPhone),
    },
    { type: "OPEN_MENU", iconSrc: ACTION_ICONS.pickYourMeal, href: data.menuUrl, available: true },
    {
      type: "EXTERNAL_ORDER",
      iconSrc: ACTION_ICONS.onlineOrderPay,
      href: data.externalOrderingUrl,
      available: Boolean(data.externalOrderingUrl),
      external: true,
    },
    {
      type: "ADD_CONTACT",
      iconSrc: ACTION_ICONS.addContact,
      href: data.contactCardUrl,
      available: data.hasContactData && Boolean(data.contactCardUrl),
    },
  ];
}

/** Build the floating speed-dial contact actions (only configured ones). */
export function buildFloatingActions(data: RestaurantPublicActionData): FloatingContactAction[] {
  const all: (FloatingContactAction | null)[] = [
    data.orderPhone
      ? { key: "call", icon: "Phone", href: `tel:${data.orderPhone}`, external: false, labelKey: "rb.callUs" }
      : null,
    data.whatsappUrl
      ? { key: "whatsapp", icon: "MessageCircle", href: data.whatsappUrl, external: true, labelKey: "rb.whatsapp" }
      : null,
    data.directionsUrl
      ? { key: "directions", icon: "MapPin", href: data.directionsUrl, external: true, labelKey: "rb.directions" }
      : null,
    data.instagramUrl
      ? { key: "instagram", icon: "Instagram", href: data.instagramUrl, external: true, labelKey: "rb.instagram" }
      : null,
    data.facebookUrl
      ? { key: "facebook", icon: "Facebook", href: data.facebookUrl, external: true, labelKey: "rb.facebook" }
      : null,
    data.websiteUrl
      ? { key: "website", icon: "Globe", href: data.websiteUrl, external: true, labelKey: "rb.website" }
      : null,
    data.publicEmail
      ? { key: "email", icon: "Mail", href: `mailto:${data.publicEmail}`, external: false, labelKey: "rb.email" }
      : null,
  ];
  return all.filter((a): a is FloatingContactAction => a !== null);
}
