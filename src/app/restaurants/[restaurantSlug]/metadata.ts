import type { Metadata } from "next";
import type { Restaurant } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";

/**
 * Build page metadata from a restaurant. Description falls back to the tagline,
 * then a neutral line — never a fabricated claim.
 */
export function restaurantMetadata(
  restaurant: Restaurant,
  overrides?: { title?: string; description?: string },
): Metadata {
  const name = restaurant.displayName || restaurant.name;
  const description =
    overrides?.description ||
    resolveText(restaurant.descriptions.public, "en") ||
    resolveText(restaurant.tagline, "en");

  return {
    title: overrides?.title ?? name,
    description: description || undefined,
    openGraph: {
      title: overrides?.title ?? name,
      description: description || undefined,
      type: "website",
    },
  };
}
