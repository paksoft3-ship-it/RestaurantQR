"use client";

import { loadConsent } from "@/lib/cookies/consent";

/** Event names for restaurant public-action interactions. */
export type RestaurantActionEvent =
  | "restaurant_fixed_action_clicked"
  | "restaurant_contact_menu_opened"
  | "restaurant_contact_menu_closed"
  | "restaurant_contact_action_clicked"
  | "restaurant_vcard_downloaded"
  | "restaurant_external_ordering_opened"
  | "restaurant_call_action_clicked"
  | "restaurant_menu_action_clicked";

export interface RestaurantActionEventProps {
  restaurantId: string;
  restaurantSlug: string;
  actionType: string;
  placement: "fixed_bottom_bar" | "floating_contact_menu";
  locale: string;
  destinationType?: string;
}

/**
 * Record a restaurant action interaction — consent-aware and non-blocking.
 *
 * Only fires when the user has granted Analytics consent. Sends NO PII (no full
 * phone/email/URL, no identity, no contact-card contents). No real analytics
 * provider is wired in this build, so events are logged in development only;
 * production routes this to the configured provider. Never throws — a tracking
 * failure must not block the underlying navigation.
 */
export function trackRestaurantAction(
  event: RestaurantActionEvent,
  props: RestaurantActionEventProps,
): void {
  try {
    if (typeof window === "undefined") return;
    const consent = loadConsent();
    if (!consent.decided || !consent.choices.analytics) return;

    // Safe payload only — never include destinations/identities.
    const payload = {
      restaurantId: props.restaurantId,
      restaurantSlug: props.restaurantSlug,
      actionType: props.actionType,
      placement: props.placement,
      locale: props.locale,
      destinationType: props.destinationType,
    };

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", event, payload);
    }
    // Production: forward `event` + `payload` to the configured analytics provider here.
  } catch {
    // Never let analytics break navigation.
  }
}
