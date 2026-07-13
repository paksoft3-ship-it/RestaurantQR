import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ExamplesGrid, type ExampleRestaurant } from "@/components/marketing/examples-grid";
import { CtaSection } from "@/components/marketing/cta-section";
import { Badge } from "@/components/ui/badge";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { titleCase } from "@/lib/utils";
import { VISUAL_DIRECTIONS } from "@/domain/enums";

export const metadata: Metadata = {
  title: "Restaurant Examples",
  description:
    "Explore demo restaurant experiences built on YourPlatform across different visual directions. These are illustrative examples, not verified clients.",
};

const directions = VISUAL_DIRECTIONS.map((id) => ({ id, label: titleCase(id) }));

export default async function RestaurantExamplesPage() {
  const repos = getRepositories();
  // Only published restaurants are shown publicly as examples (drafts and
  // in-progress restaurants stay hidden until an admin publishes them).
  const { items } = await repos.restaurants.list({ pageSize: 50, publishingStatus: "published" });
  const brandings = await Promise.all(items.map((r) => repos.branding.get(r.id)));

  const restaurants: ExampleRestaurant[] = items.map((r, i) => ({
    slug: r.slug,
    name: r.displayName,
    tagline: resolveText(r.tagline, "en") || resolveText(r.descriptions.public, "en"),
    direction: r.visualDirection,
    directionLabel: titleCase(r.visualDirection),
    cuisines: r.cuisines,
    href: routes.restaurant.home(r.slug),
    image: brandings[i]?.coverImage ?? null,
  }));

  return (
    <>
      <section className="py-16 md:py-20">
        <Container className="flex flex-col items-center gap-4">
          <Badge intent="primary">Demo & illustrative experiences</Badge>
          <SectionHeading
            as="h1"
            eyebrow="Restaurant Examples"
            title="See the platform in action"
            description="Each example is a demo restaurant experience created by our team to show a visual direction. They are illustrative samples — not verified client claims."
          />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <ExamplesGrid restaurants={restaurants} directions={directions} />
        </Container>
      </section>

      <CtaSection
        title="Picture your restaurant here"
        description="Request a quote and we'll prepare a tailored example for your brand."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
        secondary={{ label: "Open Pizza House demo", href: routes.restaurant.home("pizza-house") }}
      />
    </>
  );
}
