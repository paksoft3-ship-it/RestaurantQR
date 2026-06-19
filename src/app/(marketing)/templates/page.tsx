import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { TemplateCard } from "@/components/marketing/template-card";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Restaurant Templates",
  description:
    "Five managed visual directions — Modern Fast Food, Warm Mediterranean, Premium Dining, Fresh & Healthy, and Café & Bakery — tailored to your brand by our team.",
};

const templates = [
  { name: "Modern Fast Food", description: "Bold, energetic and conversion-focused for pizza, burgers and casual dining.", bestFor: "Pizzerias, burger bars, fried chicken, street food", image: "/images/templates/modern-fast-food.jpg" },
  { name: "Warm Mediterranean", description: "Inviting, earthy tones for grills, mezze and Mediterranean kitchens.", bestFor: "Grills, kebab houses, mezze restaurants", image: "/images/templates/warm-mediterranean.jpg" },
  { name: "Premium Dining", description: "Refined and elegant for fine dining and signature restaurants.", bestFor: "Fine dining, seafood, steakhouses", image: "/images/templates/premium-dining.jpg" },
  { name: "Fresh & Healthy", description: "Clean, bright and vibrant for bowls, salads and juices.", bestFor: "Healthy fast-casual, juice bars, vegan", image: "/images/templates/fresh-healthy.jpg" },
  { name: "Café & Bakery", description: "Cosy and crafted for cafés, bakeries and brunch spots.", bestFor: "Cafés, bakeries, brunch, patisseries", image: "/images/templates/cafe-bakery.jpg" },
];

export default function TemplatesPage() {
  return (
    <>
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Templates"
            title="Five managed starting directions"
            description="These are managed visual directions, not self-service themes. Our team tailors the chosen direction to your brand, colours and photography."
          />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.name}
                name={t.name}
                description={t.description}
                bestFor={t.bestFor}
                image={t.image}
              />
            ))}
          </div>
        </Container>
      </section>

      <CtaSection
        title="Not sure which direction fits your restaurant?"
        description="Tell us about your brand and we'll recommend a direction in your quote."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
        secondary={{ label: "See examples", href: routes.marketing.restaurantExamples() }}
      />
    </>
  );
}
