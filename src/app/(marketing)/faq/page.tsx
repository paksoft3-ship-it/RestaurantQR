import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FaqAccordion, type FaqItem } from "@/components/marketing/faq-accordion";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about YourPlatform's managed QR/NFC restaurant service — how it works, products, languages, updates and ordering.",
};

const categories = [
  { id: "general", label: "General" },
  { id: "managed", label: "Managed service" },
  { id: "qr-nfc", label: "QR & NFC" },
  { id: "menu", label: "Menu & ordering" },
  { id: "updates", label: "Updates & support" },
];

const items: FaqItem[] = [
  { id: "what-is", category: "general", question: "What is YourPlatform?", answer: "A managed QR/NFC restaurant platform. We create and maintain branded restaurant pages, digital menus and QR/NFC products on your behalf." },
  { id: "who-for", category: "general", question: "Who is it for?", answer: "Restaurants that want a professional digital experience without managing any software themselves." },
  { id: "do-i-login", category: "managed", question: "Do I get a login or dashboard?", answer: "No. YourPlatform is a fully managed service. There are no restaurant-owner accounts, logins or dashboards — our team handles everything." },
  { id: "approve", category: "managed", question: "Do I approve changes before they go live?", answer: "Yes. You review a private preview and nothing is published without your approval." },
  { id: "qr-nfc-diff", category: "qr-nfc", question: "What's the difference between QR and NFC?", answer: "QR codes are scanned with a camera; NFC products are tapped with a phone. Both open the same branded restaurant experience." },
  { id: "products", category: "qr-nfc", question: "What QR/NFC products are available?", answer: "Table tents, NFC table stands, NFC cards, QR and NFC stickers, window stickers, counter displays and printed cards — all configured and produced for you." },
  { id: "four-actions", category: "menu", question: "What are the four customer actions?", answer: "Call Order, Pick Your Meal, Online Order with Pay, and Visit Us — the actions guests use most, placed front and centre." },
  { id: "online-order", category: "menu", question: "Is there a checkout or cart?", answer: "No internal checkout. 'Online Order with Pay' links to your existing external ordering or delivery website." },
  { id: "languages", category: "menu", question: "Can the experience be multilingual?", answer: "Yes. We can configure a primary language and additional languages for your restaurant." },
  { id: "updates", category: "updates", question: "How do I update my menu or hours?", answer: "Just send us the changes. Our team keeps your menu, hours, links and campaigns up to date." },
  { id: "support", category: "updates", question: "What kind of support is included?", answer: "Ongoing managed support is part of the service. Specific terms are confirmed in your quote." },
  { id: "pricing", category: "general", question: "How much does it cost?", answer: "Pricing is tailored to your restaurant — there are no fixed setup fees. Request a quote and we'll prepare clear pricing." },
];

export default function FaqPage() {
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
