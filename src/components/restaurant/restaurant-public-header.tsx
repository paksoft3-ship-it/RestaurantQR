import Link from "next/link";
import Image from "next/image";
import type { Restaurant } from "@/domain/entities";
import { routes } from "@/lib/routes";
import { LanguageSelector } from "@/components/shared/language-selector";

interface RestaurantPublicHeaderProps {
  restaurant: Restaurant;
  /** Branding logo URL; falls back to the wordmark when absent. */
  logoUrl?: string | null;
}

/**
 * Sticky identity header for the restaurant public shell. Distinct from the
 * marketing header — it carries the restaurant logo + name and a language
 * selector. When no logo is configured, the wordmark stands alone.
 */
export function RestaurantPublicHeader({ restaurant, logoUrl }: RestaurantPublicHeaderProps) {
  const name = restaurant.displayName || restaurant.name;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between gap-3 px-5">
        <Link
          href={routes.restaurant.home(restaurant.slug)}
          aria-label={name}
          className="flex items-center gap-2 font-display text-h3 font-extrabold tracking-tight text-primary"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 rounded-[8px] object-contain"
              aria-hidden
            />
          ) : null}
          <span className="truncate">{name}</span>
        </Link>
        <LanguageSelector />
      </div>
    </header>
  );
}
