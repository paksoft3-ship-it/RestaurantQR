import { getRepositories } from "@/data/repositories";
import type { CustomerAction, RestaurantLocation } from "@/domain/entities";
import { safeWebUrl } from "@/lib/restaurant-actions/urlSafety";

/**
 * Public restaurant vCard (Add Contact). Returns ONLY approved public fields —
 * never internal contacts, staff data, or notes. Values are escaped per vCard
 * 3.0 with CRLF line endings; UTF-8.
 */

/** Escape a vCard text value (RFC 6350 §3.4 / vCard 3.0). */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function destinationFor(actions: CustomerAction[], type: CustomerAction["type"]): string | null {
  const match = actions.find((a) => a.enabled && a.type === type && a.destination?.trim());
  return match?.destination?.trim() ?? null;
}

function addressParts(location: RestaurantLocation | null): string | null {
  if (!location) return null;
  const street = location.address ?? "";
  const city = [location.district, location.city].filter(Boolean).join(" ");
  const region = "";
  const postal = location.postalCode ?? "";
  const country = location.country ?? "";
  if (![street, city, postal, country].some(Boolean)) return null;
  // ADR structured: PO;ext;street;locality;region;postal;country
  return [";;", esc(street), ";", esc(city), ";", esc(region), ";", esc(postal), ";", esc(country)].join("");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ restaurantSlug: string }> },
): Promise<Response> {
  const { restaurantSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) {
    return new Response("Not found", { status: 404 });
  }

  const [actions, locations] = await Promise.all([
    repos.menus.customerActions(restaurant.id),
    repos.restaurants.locations(restaurant.id),
  ]);
  const location = locations[0] ?? null;

  const name = restaurant.displayName || restaurant.name;
  const phone = destinationFor(actions, "call-order");
  const email = destinationFor(actions, "email");
  const orderingUrl = safeWebUrl(destinationFor(actions, "online-order"), { allowHttp: true });
  const adr = addressParts(location);

  // Don't generate an empty vCard.
  if (!phone && !email && !adr) {
    return new Response("Insufficient contact information", { status: 422 });
  }

  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(name)}`, `ORG:${esc(name)}`];
  if (phone) lines.push(`TEL;TYPE=WORK,VOICE:${esc(phone)}`);
  if (email) lines.push(`EMAIL;TYPE=WORK,INTERNET:${esc(email)}`);
  if (adr) lines.push(`ADR;TYPE=WORK:${adr}`);
  if (orderingUrl) lines.push(`URL:${esc(orderingUrl)}`);
  lines.push("END:VCARD");

  const body = lines.join("\r\n") + "\r\n";
  const filename = `${restaurantSlug}-contact.vcf`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
