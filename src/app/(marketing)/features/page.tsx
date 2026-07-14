import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { FeatureCard } from "@/components/marketing/feature-card";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";
import { loadWebsiteCopy } from "@/lib/website-content";

export const metadata: Metadata = {
  title: "Platform Features",
  description:
    "Branded restaurant homepage, digital menu, product detail, contact & location, external ordering, QR, NFC, campaigns, languages, analytics and managed updates.",
};

const features = [
  { icon: "Store", title: "Restaurant homepage", description: "A branded landing page built around your four key customer actions." },
  { icon: "BookOpen", title: "Digital menu", description: "Searchable categories, products, prices, photos and dietary labels." },
  { icon: "UtensilsCrossed", title: "Product detail", description: "Rich product pages with variants, allergen notes and availability." },
  { icon: "MapPin", title: "Contact & location", description: "Phone, WhatsApp, email, address, map directions and opening hours." },
  { icon: "ShoppingBag", title: "External ordering", description: "Link directly to your existing online ordering and delivery platforms." },
  { icon: "QrCode", title: "QR codes", description: "Custom QR codes for tables, windows, stickers and printed cards." },
  { icon: "Nfc", title: "NFC products", description: "Tap-to-open NFC stands, cards and stickers that open the same page." },
  { icon: "Megaphone", title: "Campaigns", description: "Promotions and reward mechanics like Scan & Win, managed end to end." },
  { icon: "Languages", title: "Languages", description: "Multi-language experiences with a primary and additional languages." },
  { icon: "ChartColumn", title: "Analytics", description: "Interaction reporting on scans, taps, menu views and action clicks." },
  { icon: "RefreshCw", title: "Managed updates", description: "Send changes anytime — our team keeps everything accurate." },
  { icon: "ShieldCheck", title: "Reviewed publishing", description: "Nothing goes live without your review and approval." },
];

// Reflect admin-published content without a rebuild.
export const revalidate = 30;

export default async function FeaturesPage() {
  const copy = await loadWebsiteCopy();
  return (
    <>
      <section className="py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Features"
            title={copy("features", "lead", "Everything a modern restaurant experience needs")}
            description="A complete, managed toolkit — delivered for you, not another dashboard to learn."
          />
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </Container>
      </section>

      <CtaSection
        title="See the features in a live demo"
        description="Explore the Pizza House demo, then request a tailored quote."
        primary={{ label: "View Demo", href: routes.restaurant.home("pizza-house"), icon: "ArrowRight" }}
        secondary={{ label: "Request a Quote", href: routes.marketing.contact() }}
      />
    </>
  );
}
