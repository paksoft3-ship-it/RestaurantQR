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

      {/* Developed-by badge — uses the restaurant's brand colour. */}
      <a
        href="https://paksoft.com.tr"
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-6 inline-flex items-center gap-1.5 text-sm"
      >
        <span className="text-white/50 transition-colors group-hover:text-white">Developed by</span>
        <span className="flex items-center gap-1 text-primary transition-colors group-hover:text-accent">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4 -rotate-12">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.08-1.38-.7.13-1.42.21-2.16.21-5.52 0-10-4.48-10-10S9.42 2.83 14.92 2.83c.74 0 1.46.08 2.16.21C15.58 2.5 13.85 2 12 2z" />
          </svg>
          <span className="text-sm font-bold tracking-wide">PakSoft</span>
        </span>
      </a>
    </footer>
  );
}
