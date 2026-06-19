import type { Restaurant } from "@/domain/entities";
import { appConfig } from "@/lib/config/app-config";

interface RestaurantFooterProps {
  restaurant: Restaurant;
}

/** Dark footer with the restaurant identity and a "powered by" platform line. */
export function RestaurantFooter({ restaurant }: RestaurantFooterProps) {
  const name = restaurant.displayName || restaurant.name;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy px-5 py-10 text-center text-white">
      <p className="font-display text-h2 font-bold">{name}</p>
      <p className="mt-2 text-xs text-white/60">
        © {year} {name}. All rights reserved.
      </p>
      <div className="mt-8 flex flex-col items-center gap-1">
        <span className="text-[10px] uppercase tracking-[2px] text-white/40">Powered by</span>
        <span className="font-heading text-h3 font-bold tracking-tight text-primary">
          {appConfig.appName}
        </span>
      </div>
    </footer>
  );
}
