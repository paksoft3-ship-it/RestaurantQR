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

  /**
   * Admin-chosen icon overrides for the four fixed bottom-bar buttons, keyed by
   * action type. Value is a lucide icon name or an image URL; null = built-in.
   */
  iconOverrides: {
    callOrder: string | null;
    pickYourMeal: string | null;
    externalOrder: string | null;
    addContact: string | null;
  };

  /**
   * The bottom "Add Contact" button destination. When the admin set a link on
   * the save-contact / visit-us action it is used directly (with `addContactMode`
   * describing how to open it); otherwise this is the generated vCard URL and
   * the mode is "download".
   */
  addContactHref: string | null;
  addContactMode: "download" | "external" | "tel" | "internal";

  /** Extra admin-defined buttons, rendered in the floating "+" menu. */
  custom: {
    key: string;
    label: string;
    /** lucide icon name or image URL. */
    icon: string | null;
    href: string;
    external: boolean;
  }[];
}

/** How a fixed-bar action opens (maps to RestaurantActionItem `mode`). */
export type FixedActionMode = "internal" | "tel" | "external" | "download";

/** The four fixed bottom-bar actions, as a discriminated union. */
export type FixedRestaurantAction =
  | { type: "CALL_ORDER"; iconSrc: string; iconOverride: string | null; href: string | null; available: boolean; label: string | null }
  | { type: "OPEN_MENU"; iconSrc: string; iconOverride: string | null; href: string; available: true; label: string | null }
  | { type: "EXTERNAL_ORDER"; iconSrc: string; iconOverride: string | null; href: string | null; available: boolean; external: true; label: string | null }
  | { type: "ADD_CONTACT"; iconSrc: string; iconOverride: string | null; href: string | null; available: boolean; mode: FixedActionMode; label: string | null };

export type FixedActionType = FixedRestaurantAction["type"];

/** A floating speed-dial contact/social action. */
export interface FloatingContactAction {
  key: string;
  /** lucide icon name (resolved by the shared Icon component) or image URL. */
  icon: string;
  href: string;
  external: boolean;
  /** Translation key for built-in actions. */
  labelKey?: string;
  /** Literal label for admin-defined custom actions (takes precedence). */
  label?: string;
}
