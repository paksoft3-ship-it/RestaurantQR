import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { PackageCard } from "@/components/marketing/package-card";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description:
    "Managed packages: Digital Starter, QR & NFC Business, Complete Restaurant Experience, and Multi-Location & Custom. Pricing is tailored — request a quote.",
};

const packages = [
  {
    name: "Digital Starter",
    summary: "A branded restaurant page and digital menu, fully set up for you.",
    features: ["Branded restaurant homepage", "Digital menu & product pages", "Contact & location", "The four customer actions", "One visual direction"],
  },
  {
    name: "QR & NFC Business",
    summary: "Everything in Starter plus configured QR and NFC products.",
    features: ["Everything in Digital Starter", "Custom QR codes", "NFC table stands & cards", "Managed menu updates", "Basic interaction reporting"],
    highlighted: true,
    badge: "Most popular",
  },
  {
    name: "Complete Restaurant Experience",
    summary: "A full managed experience with campaigns and richer reporting.",
    features: ["Everything in QR & NFC Business", "Promotional campaigns", "Multi-language experience", "Full interaction analytics", "Priority managed updates"],
  },
  {
    name: "Multi-Location & Custom",
    summary: "Tailored setup for groups, franchises and bespoke requirements.",
    features: ["Multiple locations", "Custom visual direction", "Bespoke QR/NFC rollout", "Dedicated setup support", "Custom reporting"],
  },
];

export default function PackagesPage() {
  return (
    <>
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Packages"
            title="Managed packages, tailored pricing"
            description="Every restaurant is different, so pricing is custom-tailored. Tell us what you need and we'll prepare a quote — no fixed setup fees."
          />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <PackageCard
                key={p.name}
                name={p.name}
                summary={p.summary}
                features={p.features}
                ctaHref={routes.marketing.contact()}
                highlighted={p.highlighted}
                badge={p.badge}
              />
            ))}
          </div>
        </Container>
      </section>

      <CtaSection
        title="Tell us what your restaurant needs"
        description="Share your goals and we'll recommend the right package with clear pricing."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
      />
    </>
  );
}
