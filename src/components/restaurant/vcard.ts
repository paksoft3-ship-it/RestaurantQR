import type { CustomerAction, Restaurant, RestaurantLocation } from "@/domain/entities";

/** Find the first enabled action of a given type with a destination. */
function destinationFor(actions: CustomerAction[], type: CustomerAction["type"]): string | null {
  const match = actions.find((a) => a.enabled && a.type === type && a.destination);
  return match?.destination ?? null;
}

function addressLine(location: RestaurantLocation | null): string | null {
  if (!location) return null;
  const parts = [location.address, location.district, location.city, location.postalCode, location.country];
  const joined = parts.filter(Boolean).join(", ");
  return joined || null;
}

/**
 * Build a vCard 3.0 string from a restaurant's public details. Only includes
 * fields we actually have — never fabricates a phone, email or address.
 * Returns null when there is nothing meaningful to save.
 */
export function buildVCard(
  restaurant: Restaurant,
  actions: CustomerAction[],
  location: RestaurantLocation | null,
): string | null {
  const name = restaurant.displayName || restaurant.name;
  const phone = destinationFor(actions, "call-order");
  const email = destinationFor(actions, "email");
  const address = addressLine(location);
  const instagram = destinationFor(actions, "instagram");

  if (!phone && !email && !address) return null;

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${name}`, `ORG:${name}`];
  if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${phone}`);
  if (email) lines.push(`EMAIL;TYPE=WORK:${email}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${address.replace(/,/g, ";")}`);
  if (instagram) lines.push(`URL:${instagram}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/** Encode a vCard as a downloadable data: URL. */
export function vCardDataUrl(vcard: string): string {
  return `data:text/vcard;charset=utf-8,${encodeURIComponent(vcard)}`;
}
