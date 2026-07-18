import type { CustomerAction, Restaurant, RestaurantLocation } from "@/domain/entities";
import type { CustomerActionType, DestinationType } from "@/domain/enums";
import type { Locale } from "@/lib/i18n/locales";
import { resolveText } from "@/lib/i18n/locales";
import { routes } from "@/lib/routes";
import {
  type FixedActionMode,
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

function findEnabled(actions: CustomerAction[], type: CustomerActionType): CustomerAction | null {
  return actions.find((a) => a.enabled && a.type === type && a.destination?.trim()) ?? null;
}

function destinationFor(actions: CustomerAction[], type: CustomerActionType): string | null {
  return findEnabled(actions, type)?.destination?.trim() ?? null;
}

/** The admin-chosen icon override (lucide name or image URL) for an action type. */
function iconFor(actions: CustomerAction[], type: CustomerActionType): string | null {
  const match = actions.find((a) => a.type === type);
  const icon = match?.icon?.trim();
  return icon ? icon : null;
}

/** The admin-set public label for an action type, or null to use the default. */
function labelFor(
  actions: CustomerAction[],
  type: CustomerActionType,
  locale: Locale,
): string | null {
  const match = actions.find((a) => a.type === type);
  if (!match) return null;
  const text = resolveText(match.label, locale)?.trim();
  return text ? text : null;
}

interface ResolvedDestination {
  href: string;
  mode: FixedActionMode;
  external: boolean;
}

/**
 * Turn a destination type + value into a safe href + how it should open.
 * Reuses the shared URL-safety helpers (production stays https-only for web
 * links). Returns null when the destination is missing or unsafe.
 */
function resolveDestination(
  destinationType: DestinationType,
  destination: string | null | undefined,
  allowHttp: boolean,
): ResolvedDestination | null {
  const value = destination?.trim();
  if (!value) return null;
  switch (destinationType) {
    case "phone": {
      const phone = normalizePhone(value);
      return phone ? { href: `tel:${phone}`, mode: "tel", external: false } : null;
    }
    case "email": {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
      return { href: `mailto:${value}`, mode: "tel", external: false };
    }
    case "whatsapp": {
      const wa = buildWhatsappUrl(value);
      return wa ? { href: wa, mode: "external", external: true } : null;
    }
    case "external":
    case "map": {
      const web = safeWebUrl(value, { allowHttp });
      return web ? { href: web, mode: "external", external: true } : null;
    }
    case "internal": {
      // Same-origin app paths ("/...") are internal links.
      if (value.startsWith("/")) return { href: value, mode: "internal", external: false };
      // An admin may paste a full URL into an "internal" action (e.g. a hosted
      // flipbook menu). Treat a safe absolute URL as external (opens a new tab).
      const web = safeWebUrl(value, { allowHttp });
      return web ? { href: web, mode: "external", external: true } : null;
    }
    default:
      return null;
  }
}

/** Resolve an enabled action of a given type to a safe href + open mode. */
function resolveEnabled(
  actions: CustomerAction[],
  type: CustomerActionType,
  allowHttp: boolean,
): ResolvedDestination | null {
  const action = findEnabled(actions, type);
  if (!action) return null;
  return resolveDestination(action.destinationType, action.destination, allowHttp);
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

  // "Pick Your Meal" opens the admin-set link when one is configured, otherwise
  // the internal digital-menu page. The top card and the bottom-bar button both
  // read this, so they always point at the same destination.
  const menuUrl = routes.restaurant.menu(slug);
  const pickYourMealLink = resolveEnabled(actions, "pick-your-meal", allowHttp);
  const pickYourMealUrl = pickYourMealLink?.href ?? menuUrl;
  const pickYourMealExternal = pickYourMealLink?.external ?? false;
  const whatsappUrl = buildWhatsappUrl(destinationFor(actions, "whatsapp"));
  const instagramUrl = safeWebUrl(destinationFor(actions, "instagram"), { allowHttp });
  const publicEmail = destinationFor(actions, "email");

  const hasContactData = Boolean(orderPhone || publicEmail || addressLine(location));
  const contactCardUrl = hasContactData ? `/api/restaurants/${slug}/contact-card` : null;

  // The bottom "Add Contact" button uses the admin-set link on the (renamed)
  // visit-us action, or a dedicated save-contact action; otherwise it falls back
  // to the generated vCard download.
  const addContactLink =
    resolveEnabled(actions, "save-contact", allowHttp) ?? resolveEnabled(actions, "visit-us", allowHttp);
  const addContactHref = addContactLink?.href ?? contactCardUrl;
  const addContactMode: RestaurantPublicActionData["addContactMode"] = addContactLink
    ? addContactLink.mode
    : "download";

  // "Directions" in the floating menu comes from the location's own map URL, so
  // it stays independent of the visit-us action (which now drives Add Contact).
  const directionsUrl = safeWebUrl(location?.mapUrl, { allowHttp });

  // Admin-defined extra buttons → floating "+" menu items.
  const custom: RestaurantPublicActionData["custom"] = actions
    .filter((a) => a.enabled && a.type === "custom")
    .map((a) => {
      const resolved = resolveDestination(a.destinationType, a.destination, allowHttp);
      if (!resolved) return null;
      return {
        key: a.id,
        label: resolveText(a.label, locale)?.trim() || "Link",
        icon: a.icon?.trim() || null,
        href: resolved.href,
        external: resolved.external,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return {
    restaurantId: restaurant.id,
    restaurantSlug: slug,
    restaurantName: restaurant.displayName || restaurant.name,
    locale,
    orderPhone,
    primaryPhone: orderPhone,
    menuUrl,
    pickYourMealUrl,
    pickYourMealExternal,
    externalOrderingUrl,
    contactCardUrl,
    hasContactData,
    whatsappUrl,
    directionsUrl,
    instagramUrl,
    facebookUrl: null, // no facebook field in the data model — hidden by design
    websiteUrl: null, // no dedicated public website field — hidden by design
    publicEmail,
    labels: {
      callOrder: labelFor(actions, "call-order", locale),
      pickYourMeal: labelFor(actions, "pick-your-meal", locale),
      externalOrder: labelFor(actions, "online-order", locale),
      // The bottom "Add Contact" button follows the save-contact action if set,
      // otherwise the (renamed) visit-us action's label.
      addContact:
        labelFor(actions, "save-contact", locale) ?? labelFor(actions, "visit-us", locale),
    },
    iconOverrides: {
      callOrder: iconFor(actions, "call-order"),
      pickYourMeal: iconFor(actions, "pick-your-meal"),
      externalOrder: iconFor(actions, "online-order"),
      addContact: iconFor(actions, "save-contact") ?? iconFor(actions, "visit-us"),
    },
    addContactHref,
    addContactMode,
    custom,
  };
}

/** Build the four ordered fixed bottom-bar actions. */
export function buildFixedActions(data: RestaurantPublicActionData): FixedRestaurantAction[] {
  return [
    {
      type: "CALL_ORDER",
      iconSrc: ACTION_ICONS.callOrder,
      iconOverride: data.iconOverrides.callOrder,
      href: data.orderPhone ? `tel:${data.orderPhone}` : null,
      available: Boolean(data.orderPhone),
      label: data.labels.callOrder,
    },
    {
      type: "OPEN_MENU",
      iconSrc: ACTION_ICONS.pickYourMeal,
      iconOverride: data.iconOverrides.pickYourMeal,
      href: data.pickYourMealUrl,
      available: true,
      external: data.pickYourMealExternal,
      label: data.labels.pickYourMeal,
    },
    {
      type: "EXTERNAL_ORDER",
      iconSrc: ACTION_ICONS.onlineOrderPay,
      iconOverride: data.iconOverrides.externalOrder,
      href: data.externalOrderingUrl,
      available: Boolean(data.externalOrderingUrl),
      external: true,
      label: data.labels.externalOrder,
    },
    {
      type: "ADD_CONTACT",
      iconSrc: ACTION_ICONS.addContact,
      iconOverride: data.iconOverrides.addContact,
      href: data.addContactHref,
      available: Boolean(data.addContactHref),
      mode: data.addContactMode,
      label: data.labels.addContact,
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
  // Append admin-defined custom buttons after the built-in contact actions.
  for (const c of data.custom) {
    all.push({ key: c.key, icon: c.icon ?? "Link", href: c.href, external: c.external, label: c.label });
  }
  return all.filter((a): a is FloatingContactAction => a !== null);
}
