import Image from "next/image";
import type { OpeningHours, Restaurant, RestaurantLocation } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { RestaurantStatus } from "./restaurant-status";

interface RestaurantHeroProps {
  restaurant: Restaurant;
  hours: OpeningHours[];
  location: RestaurantLocation | null;
  coverImage?: string | null;
}

/** Bold appetizing hero with cover imagery, identity and open/closed badge. */
export function RestaurantHero({ restaurant, hours, location, coverImage }: RestaurantHeroProps) {
  const name = restaurant.displayName || restaurant.name;
  const tagline = resolveText(restaurant.tagline, "en");
  const cuisines = restaurant.cuisines.slice(0, 3).join(" · ");
  const place = [location?.district, location?.city].filter(Boolean).join(", ");

  return (
    <section className="relative h-[360px] w-full overflow-hidden md:rounded-b-[20px]">
      <Image
        src={coverImage || "/placeholders/cover.svg"}
        alt={`${name} cover photo`}
        width={640}
        height={360}
        priority
        className="absolute inset-0 size-full object-cover"
      />
      {/* Extra bottom padding keeps the identity text clear of the action grid,
          which overlaps the hero from below. */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-14 pt-5 text-white">
        <RestaurantStatus hours={hours} onImage className="mb-3" />
        <h1 className="font-display text-h1 font-extrabold tracking-tight">{name}</h1>
        {tagline ? <p className="mt-1 text-body italic text-white/90">{tagline}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-white/85">
          {cuisines ? <span>{cuisines}</span> : null}
          {cuisines && place ? <span className="size-1 rounded-full bg-white/60" aria-hidden /> : null}
          {place ? <span>{place}</span> : null}
        </div>
      </div>
    </section>
  );
}
