import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductCard } from "@/components/marketing/product-card";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "QR & NFC Products",
  description:
    "Managed QR and NFC products — table tents, table stands, cards, stickers, window stickers, counter displays and printed cards — all opening your live restaurant experience.",
};

const products = [
  { name: "QR table tent", category: "QR", icon: "QrCode", image: "/images/products/qr-table-tent.png", description: "Freestanding table tent with your branded QR code for dine-in guests." },
  { name: "NFC table stand", category: "NFC", icon: "Nfc", image: "/images/products/nfc-table-stand.png", description: "Tap-to-open NFC stand that brings up your menu instantly.", badge: "Popular" },
  { name: "NFC card", category: "NFC", icon: "CreditCard", image: "/images/products/nfc-card.png", description: "Pocket-sized NFC card for counters, hosts and events." },
  { name: "QR sticker", category: "QR", icon: "QrCode", image: "/images/products/qr-sticker.png", description: "Durable QR stickers for tables, packaging and takeaway bags." },
  { name: "NFC sticker", category: "NFC", icon: "Nfc", image: "/images/products/nfc-sticker.png", description: "Slim NFC sticker you can place on almost any surface." },
  { name: "Window sticker", category: "QR", icon: "AppWindow", image: "/images/products/window-sticker.png", description: "Storefront window QR so passers-by can browse your menu." },
  { name: "Counter display", category: "QR/NFC", icon: "Store", image: "/images/products/counter-display.png", description: "Counter-top display combining QR and NFC for quick access." },
  { name: "Printed card", category: "QR", icon: "FileText", image: "/images/products/printed-card.png", description: "Branded printed cards to hand out or include with orders." },
];

export default function QrNfcProductsPage() {
  return (
    <>
      <section className="bg-surface py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="QR & NFC Products"
            title="Physical products that open your digital experience"
            description="Every QR and NFC product is configured and produced by our team to open the same branded restaurant page. Provided as part of a managed package."
          />
        </Container>
      </section>

      <section className="pb-20 pt-12">
        <Container>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.name}
                name={p.name}
                category={p.category}
                icon={p.icon}
                image={p.image}
                description={p.description}
                badge={p.badge}
              />
            ))}
          </div>
        </Container>
      </section>

      <CtaSection
        title="Want QR and NFC products for your restaurant?"
        description="Tell us your setup and we'll recommend the right products in your quote."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
      />
    </>
  );
}
