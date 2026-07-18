import type { CustomerAction } from "@/domain/entities";
import type { CustomerActionType, DestinationType } from "@/domain/enums";

export interface ResolvedActionLink {
  href: string | null;
  /** Whether the link leaves the app (opens in a new tab). */
  external: boolean;
}

/** Icon (lucide) used to represent each customer action type. */
export const ACTION_ICON: Record<CustomerActionType, string> = {
  "call-order": "Phone",
  "pick-your-meal": "BookOpen",
  "online-order": "ShoppingBag",
  "visit-us": "MapPin",
  whatsapp: "MessageCircle",
  "save-contact": "UserPlus",
  email: "Mail",
  instagram: "Instagram",
  share: "Share2",
  custom: "Link",
};

function sanitizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

/**
 * Build a safe href for a customer action from its destination + type.
 * Returns `href: null` when the destination is missing so callers can render a
 * disabled / "to be configured" affordance rather than a broken link.
 */
export function resolveActionLink(action: {
  destinationType: DestinationType;
  destination: string | null;
}): ResolvedActionLink {
  const dest = action.destination?.trim();
  if (!dest) return { href: null, external: false };

  switch (action.destinationType) {
    case "phone":
      return { href: `tel:${sanitizePhone(dest)}`, external: false };
    case "whatsapp":
      return { href: `https://wa.me/${sanitizePhone(dest).replace(/^\+/, "")}`, external: true };
    case "email":
      return { href: `mailto:${dest}`, external: false };
    case "map":
      return { href: dest, external: true };
    case "external":
      return { href: dest, external: true };
    case "internal":
      // App paths ("/...") stay internal; a full URL pasted into an internal
      // action (e.g. a hosted flipbook menu) opens externally in a new tab.
      return { href: dest, external: /^https?:\/\//i.test(dest) };
    default:
      return { href: null, external: false };
  }
}

/** Order + filter the four primary actions for the homepage grid. */
const PRIMARY_ORDER: CustomerActionType[] = [
  "call-order",
  "pick-your-meal",
  "online-order",
  "visit-us",
];

export function primaryActions(actions: CustomerAction[]): CustomerAction[] {
  return actions
    .filter((a) => a.enabled && PRIMARY_ORDER.includes(a.type))
    .sort((a, b) => PRIMARY_ORDER.indexOf(a.type) - PRIMARY_ORDER.indexOf(b.type));
}
