import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Icon } from "@/components/shared/icon";
import { Hero } from "@/components/marketing/hero";
import { PrimaryActions, type PrimaryAction } from "@/components/marketing/primary-actions";
import { PhonePreviewStack } from "@/components/marketing/phone-preview";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";
import { appConfig } from "@/lib/config/app-config";
import { loadWebsiteCopy } from "@/lib/website-content";

export const metadata: Metadata = {
  title: `${appConfig.appName} — Managed QR & NFC Restaurant Experiences`,
  description:
    "We manage the technology so you can manage the food. A fully branded digital menu and ordering experience for restaurants, powered by managed QR and NFC.",
};

const trustStrip = [
  { icon: "Store", label: "Branded Page" },
  { icon: "BookOpen", label: "Digital Menu" },
  { icon: "QrCode", label: "Custom QR Codes" },
  { icon: "Nfc", label: "NFC Table Tents" },
  { icon: "Headset", label: "Fully Managed" },
];

const primaryActions: PrimaryAction[] = [
  {
    icon: "Phone",
    title: "Call Order",
    description: "A direct line to your front desk. One tap to dial and place an order.",
    tone: "primary",
    span: 1,
  },
  {
    icon: "BookOpen",
    title: "Pick Your Meal",
    description:
      "High-resolution, appetizing digital menus that load instantly — no app download required.",
    tone: "dark",
    span: 2,
  },
  {
    icon: "ShoppingBag",
    title: "Online Order with Pay",
    description: "Links directly to your existing external ordering and delivery platforms.",
    tone: "default",
    span: 1,
  },
  {
    icon: "MapPin",
    title: "Visit Us",
    description: "Integrated maps, directions and live operating hours.",
    tone: "warm",
    span: 1,
  },
];

const phonePreviews = [
  { src: "/images/marketing/phone-landing.png", alt: "Branded restaurant landing page preview" },
  { src: "/images/marketing/phone-menu.png", alt: "Digital menu preview" },
  { src: "/images/marketing/phone-visit.png", alt: "Visit us and directions preview" },
];

// Reflect admin-published content without a rebuild.
export const revalidate = 30;

export default async function HomePage() {
  const copy = await loadWebsiteCopy();
  return (
    <main>
      <Hero
        eyebrow="Managed Digital Experience"
        title={copy(
          "home",
          "hero",
          "Turn Every QR Scan and NFC Tap Into a Better Restaurant Experience",
        )}
        description="We manage the technology so you can manage the food. A fully branded, high-speed digital menu and ordering experience built for modern restaurants."
        primaryCta={{
          label: "Request Your QR/NFC Package",
          href: routes.marketing.contact(),
          icon: "ArrowRight",
        }}
        secondaryCta={{
          label: "View Demo Restaurant",
          href: routes.restaurant.home("pizza-house"),
          icon: "Eye",
        }}
        trustItems={[
          { icon: "CheckCircle", label: "No fixed setup fees" },
          { icon: "CheckCircle", label: "Custom-tailored pricing" },
        ]}
        visual={<PhonePreviewStack items={phonePreviews} />}
      />

      <section className="border-y border-border bg-surface py-8">
        <Container>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustStrip.map((item) => (
              <li
                key={item.label}
                className="inline-flex items-center gap-2 text-small font-semibold text-text-secondary"
              >
                <Icon name={item.icon} className="size-5 text-primary" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Four Essential Actions"
            title="Everything Your Customer Needs, Instantly"
            description="A streamlined interface designed for fast, confident decisions from the moment a guest sits down."
          />
          <PrimaryActions actions={primaryActions} />
        </Container>
      </section>

      <CtaSection
        title={copy("home", "cta", "Ready to upgrade your restaurant's digital experience?")}
        description="Let our team handle the technical details while you run the floor."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
        secondary={{ label: "View Demo", href: routes.restaurant.home("pizza-house") }}
      />
    </main>
  );
}
