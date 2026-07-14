import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";
import { getRepositories } from "@/data/repositories";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about YourPlatform's managed QR/NFC restaurant service — how it works, products, languages, updates and ordering.",
};

// Friendly labels for known category slugs; unknown ones fall back to title case.
const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  managed: "Managed service",
  "qr-nfc": "QR & NFC",
  menu: "Menu & ordering",
  updates: "Updates & support",
};

// Reflect admin-published content without a rebuild.
export const revalidate = 30;

export default async function FaqPage() {
  const entries = await getRepositories().content.faq();
  const items: FaqItem[] = entries.map((e) => ({
    id: e.id,
    category: e.category,
    question: e.question,
    answer: e.answer,
  }));
  const categories = Array.from(new Set(entries.map((e) => e.category))).map((id) => ({
    id,
    label: CATEGORY_LABELS[id] ?? titleCase(id),
  }));

  return (
    <>
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Search or browse by category. Can't find an answer? Get in touch and we'll help."
          />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <FaqAccordion items={items} categories={categories} />
        </Container>
      </section>

      <CtaSection
        title="Still have a question?"
        description="Our team is happy to help with anything not covered here."
        primary={{ label: "Contact us", href: routes.marketing.contact(), icon: "ArrowRight" }}
      />
    </>
  );
}
