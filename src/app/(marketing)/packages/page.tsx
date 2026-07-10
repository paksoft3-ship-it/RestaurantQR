import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { PackageCard } from "@/components/marketing/package-card";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";
import { getRepositories } from "@/data/repositories";

export const metadata: Metadata = {
  title: "Packages & Pricing",
  description:
    "Managed packages: Digital Starter, QR & NFC Business, Complete Restaurant Experience, and Multi-Location & Custom. Pricing is tailored — request a quote.",
};

export default async function PackagesPage() {
  const packages = await getRepositories().content.packages();
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
                key={p.id}
                name={p.name}
                summary={p.summary}
                features={p.features}
                ctaHref={routes.marketing.contact()}
                highlighted={p.highlighted}
                badge={p.badge ?? undefined}
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
