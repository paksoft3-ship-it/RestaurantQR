import type { Locale } from "@/lib/i18n/locales";

/** Normalized, serializable view model for the public restaurant action UI. */
export interface RestaurantPublicActionData {
  restaurantId: string;
  restaurantSlug: string;
  restaurantName: string;
  locale: Locale;

  orderPhone: string | null;
  primaryPhone: string | null;

  menuUrl: string;
  externalOrderingUrl: string | null;
  contactCardUrl: string | null;
  hasContactData: boolean;

  /**
   * Admin-editable public labels for the four fixed bottom-bar buttons, taken
   * from the corresponding customer actions. Null = use the default translation.
   */
  labels: {
    callOrder: string | null;
    pickYourMeal: string | null;
    externalOrder: string | null;
    addContact: string | null;
  };

  whatsappUrl: string | null;
  directionsUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  websiteUrl: string | null;
  publicEmail: string | null;
}

/** The four fixed bottom-bar actions, as a discriminated union. */
export type FixedRestaurantAction =
  | { type: "CALL_ORDER"; iconSrc: string; href: string | null; available: boolean; label: string | null }
  | { type: "OPEN_MENU"; iconSrc: string; href: string; available: true; label: string | null }
  | { type: "EXTERNAL_ORDER"; iconSrc: string; href: string | null; available: boolean; external: true; label: string | null }
  | { type: "ADD_CONTACT"; iconSrc: string; href: string | null; available: boolean; label: string | null };

export type FixedActionType = FixedRestaurantAction["type"];

/** A floating speed-dial contact/social action. */
export interface FloatingContactAction {
  key: "call" | "whatsapp" | "directions" | "instagram" | "facebook" | "website" | "email";
  /** lucide icon name (resolved by the shared Icon component). */
  icon: string;
  href: string;
  external: boolean;
  /** Translation key for the label. */
  labelKey: string;
}
