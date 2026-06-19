import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { Container } from "@/components/shared/container";
import { LocationCard } from "@/components/restaurant/location-card";
import { ContactCard } from "@/components/restaurant/contact-card";
import { SocialActions } from "@/components/restaurant/social-actions";
import { OpeningHoursCard } from "@/components/restaurant/opening-hours-card";
import { resolveActionLink } from "@/components/restaurant/action-link";
import { buildVCard, vCardDataUrl } from "@/components/restaurant/vcard";
import { restaurantMetadata } from "../metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const restaurant = await getRepositories().restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  const name = restaurant.displayName || restaurant.name;
  return restaurantMetadata(restaurant, {
    title: `Visit ${name}`,
    description: `Address, opening hours and contact details for ${name}.`,
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const [actions, hours, locations] = await Promise.all([
    repos.menus.customerActions(restaurant.id),
    repos.restaurants.openingHours(restaurant.id),
    repos.restaurants.locations(restaurant.id),
  ]);

  const location = locations[0] ?? null;
  const name = restaurant.displayName || restaurant.name;
  const visitAction = actions.find((a) => a.enabled && a.type === "visit-us");
  const mapActionUrl = visitAction ? resolveActionLink(visitAction).href : null;

  const vcard = buildVCard(restaurant, actions, location);
  const saveContactHref = vcard ? vCardDataUrl(vcard) : null;

  return (
    <Container className="py-6">
      <header className="mb-6">
        <h1 className="font-display text-h1 font-extrabold tracking-tight text-text-primary">
          Visit {name}
        </h1>
        <p className="mt-1 text-small text-text-secondary">
          Find us, get in touch and save our details.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <section aria-label="Location">
          <LocationCard location={location} mapActionUrl={mapActionUrl} />
        </section>

        <section aria-label="Contact methods">
          <h2 className="mb-3 font-heading text-h3 font-bold text-text-primary">Get in touch</h2>
          <ContactCard actions={actions} />
        </section>

        <section aria-label="More ways to connect">
          <h2 className="mb-3 font-heading text-h3 font-bold text-text-primary">
            More ways to connect
          </h2>
          <SocialActions
            actions={actions}
            saveContactHref={saveContactHref}
            saveContactFilename={`${restaurant.slug}.vcf`}
          />
        </section>

        <section aria-label="Opening hours">
          <h2 className="mb-3 font-heading text-h3 font-bold text-text-primary">Opening hours</h2>
          <OpeningHoursCard hours={hours} />
        </section>
      </div>
    </Container>
  );
}
