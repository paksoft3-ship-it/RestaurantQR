import type { RestaurantLocation } from "@/domain/entities";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface LocationCardProps {
  location: RestaurantLocation | null;
  /** Optional map destination from a configured "Visit Us" action. */
  mapActionUrl?: string | null;
  className?: string;
}

/** Build a readable, multi-line address from the available fields. */
function addressLines(location: RestaurantLocation): string[] {
  const lines: string[] = [];
  if (location.address) lines.push(location.address);
  const cityLine = [location.district, location.city, location.postalCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  if (location.country) lines.push(location.country);
  return lines;
}

/** Build a maps URL. Prefer explicit mapUrl, then coordinates, then address. */
function resolveMapUrl(
  location: RestaurantLocation | null,
  mapActionUrl?: string | null,
): string | null {
  if (location?.mapUrl) return location.mapUrl;
  if (location && location.latitude !== null && location.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }
  if (mapActionUrl) return mapActionUrl;
  if (location) {
    const query = addressLines(location).join(", ");
    if (query) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
  }
  return null;
}

/**
 * Address + "Open in Maps". When coordinates are present we show a static map
 * preview; when they're missing we deliberately do NOT fabricate a map — we
 * show the address and an "Open in Maps" link only.
 */
export function LocationCard({ location, mapActionUrl, className }: LocationCardProps) {
  if (!location) {
    return (
      <div
        className={cn(
          "rounded-[16px] border border-border bg-canvas p-5 text-small text-text-secondary shadow-card",
          className,
        )}
      >
        Location to be confirmed.
      </div>
    );
  }

  const lines = addressLines(location);
  const mapUrl = resolveMapUrl(location, mapActionUrl);
  const hasCoords = location.latitude !== null && location.longitude !== null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {hasCoords ? (
        <a
          href={mapUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-[16px] border border-border bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Open location in Maps"
        >
          <span className="flex flex-col items-center gap-1 text-primary">
            <Icon name="MapPin" className="size-10" aria-hidden />
            <span className="text-small font-semibold text-text-secondary">
              {[location.district, location.city].filter(Boolean).join(", ")}
            </span>
          </span>
        </a>
      ) : null}

      <div className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
        <h3 className="flex items-center gap-2 font-heading text-h3 font-bold text-text-primary">
          <Icon name="MapPin" className="size-5 text-primary" aria-hidden />
          Address
        </h3>
        {lines.length > 0 ? (
          <address className="mt-2 not-italic text-body text-text-secondary">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        ) : (
          <p className="mt-2 text-small text-text-secondary">Address to be confirmed.</p>
        )}
      </div>

      {mapUrl ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-button font-bold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name="Navigation" className="size-5" aria-hidden />
          Open in Maps
        </a>
      ) : null}
    </div>
  );
}
