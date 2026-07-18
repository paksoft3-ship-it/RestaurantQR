import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { Icon } from "@/components/shared/icon";
import { RestaurantHero } from "@/components/restaurant/restaurant-hero";
import { RestaurantActionGrid } from "@/components/restaurant/restaurant-action-grid";
import { ShareButton } from "@/components/restaurant/public/ShareButton";
import { MenuProductCard } from "@/components/restaurant/menu-product-card";
import { CampaignCard } from "@/components/restaurant/campaign-card";
import { OpeningHoursCard } from "@/components/restaurant/opening-hours-card";
import { LocationCard } from "@/components/restaurant/location-card";
import { resolveActionLink } from "@/components/restaurant/action-link";
import { restaurantMetadata } from "./metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const restaurant = await getRepositories().restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  return restaurantMetadata(restaurant);
}

export default async function RestaurantHomePage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const [actions, products, hours, locations, campaigns, branding] = await Promise.all([
    repos.menus.customerActions(restaurant.id),
    repos.menus.products(restaurant.id),
    repos.restaurants.openingHours(restaurant.id),
    repos.restaurants.locations(restaurant.id),
    repos.campaigns.listByRestaurant(restaurant.id),
    repos.branding.get(restaurant.id),
  ]);

  const location = locations[0] ?? null;
  const description = resolveText(restaurant.descriptions.public, "en");
  const featured = products.filter((p) => p.featured).slice(0, 3);
  const popular = featured.length > 0 ? featured : products.slice(0, 3);
  const liveCampaign = campaigns.find((c) => c.status === "active") ?? null;
  const visitAction = actions.find((a) => a.enabled && a.type === "visit-us");
  const mapActionUrl = visitAction ? resolveActionLink(visitAction).href : null;
  // "Share this page" button is on unless an admin has explicitly turned it off
  // (a disabled `share` action). Legacy restaurants with no share action stay on.
  const shareAction = actions.find((a) => a.type === "share");
  const showShare = shareAction ? shareAction.enabled : true;

  // JSON-LD only when essential fields are present (name + address).
  const jsonLd =
    location?.address && location.city
      ? {
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: restaurant.displayName || restaurant.name,
          servesCuisine: restaurant.cuisines,
          address: {
            "@type": "PostalAddress",
            streetAddress: location.address,
            addressLocality: location.city,
            postalCode: location.postalCode ?? undefined,
            addressCountry: location.country ?? undefined,
          },
        }
      : null;

  // Homepage section order + visibility comes from the page builder (falls back
  // to the default order). Hero is always first; "social" has no home section.
  const DEFAULT_LAYOUT = ["four-actions", "featured-menu", "campaign-banner", "opening-hours", "location"];
  const layoutKeys = (
    restaurant.pageLayout && restaurant.pageLayout.length > 0
      ? restaurant.pageLayout.filter((s) => s.enabled).map((s) => s.key)
      : DEFAULT_LAYOUT
  ).filter((k) => k !== "hero" && k !== "social");

  const renderSection = (key: string) => {
    switch (key) {
      case "four-actions":
        return (
          <section key={key} className="relative z-10 -mt-8 px-5">
            <RestaurantActionGrid
              actions={actions}
              menuFallbackUrl={routes.restaurant.menu(restaurant.slug)}
            />
            {showShare ? (
              <div className="mt-4 flex justify-center">
                <ShareButton slug={restaurant.slug} name={restaurant.displayName || restaurant.name} />
              </div>
            ) : null}
          </section>
        );
      case "featured-menu":
        return popular.length > 0 ? (
          <section key={key} className="mt-10 px-5">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-heading text-h3 font-bold text-text-primary">Popular choices</h2>
              <Link
                href={routes.restaurant.menu(restaurant.slug)}
                className="text-small font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                View full menu
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {popular.map((product) => (
                <MenuProductCard key={product.id} restaurantSlug={restaurant.slug} product={product} />
              ))}
            </div>
          </section>
        ) : null;
      case "campaign-banner":
        return liveCampaign ? (
          <section key={key} className="mt-10 px-5">
            <CampaignCard restaurantSlug={restaurant.slug} campaign={liveCampaign} />
          </section>
        ) : null;
      case "opening-hours":
        return (
          <section key={key} className="mt-10 px-5">
            <h2 className="mb-4 font-heading text-h3 font-bold text-text-primary">Opening hours</h2>
            <OpeningHoursCard hours={hours} />
          </section>
        );
      case "location":
        return (
          <section key={key} className="mt-10 px-5">
            <h2 className="mb-4 font-heading text-h3 font-bold text-text-primary">
              Visit {restaurant.displayName || restaurant.name}
            </h2>
            <LocationCard location={location} mapActionUrl={mapActionUrl} />
            <Link
              href={routes.restaurant.contact(restaurant.slug)}
              className="mt-4 inline-flex items-center gap-1.5 text-button font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Contact &amp; full details
              <Icon name="ArrowRight" className="size-4" aria-hidden />
            </Link>
          </section>
        );
      default:
        return null;
    }
  };

  const managedSections = layoutKeys.map((k) => renderSection(k)).filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-shell">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <RestaurantHero
        restaurant={restaurant}
        hours={hours}
        location={location}
        coverImage={branding?.coverImage}
      />

      {managedSections}

      {description ? (
        <section className="mb-12 mt-10 px-5">
          <div className="rounded-[20px] border border-outline-variant/40 bg-surface-warm p-6">
            <h2 className="font-heading text-h3 font-bold text-primary">Made fresh. Served fast.</h2>
            <p className="mt-2 text-small leading-relaxed text-text-secondary">{description}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
