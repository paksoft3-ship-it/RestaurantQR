import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Steps, type Step } from "@/components/marketing/steps";
import { CtaSection } from "@/components/marketing/cta-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How YourPlatform's fully managed service takes a restaurant from first enquiry to a live, QR/NFC-ready digital experience — and keeps it updated.",
};

const steps: Step[] = [
  { icon: "MessageSquare", title: "Restaurant enquiry", description: "You tell us about your restaurant and goals. No accounts, no setup work on your side." },
  { icon: "ClipboardList", title: "Information collection", description: "Our team gathers your menu, brand assets, contact details and locations." },
  { icon: "Palette", title: "Design & setup", description: "We build your branded restaurant page in one of five managed visual directions." },
  { icon: "BookOpen", title: "Menu preparation", description: "We structure categories, products, prices, photos and dietary labels for you." },
  { icon: "QrCode", title: "QR / NFC configuration", description: "We configure QR codes and NFC products that open your live experience." },
  { icon: "Eye", title: "Review", description: "You review a private preview. Nothing goes live until you approve it." },
  { icon: "Globe", title: "Publication", description: "We publish your experience and hand over the QR/NFC products." },
  { icon: "RefreshCw", title: "Managed updates", description: "Send changes anytime — we keep menus, hours and campaigns up to date." },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-surface-warm py-16 md:py-20">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Fully Managed"
            title="From enquiry to live experience — we handle every step"
            description="YourPlatform is a managed service. Restaurant owners never log in, build pages, or manage technology. Our team does the work and keeps it current."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <Steps steps={steps} />
        </Container>
      </section>

      <CtaSection
        title="Ready to start your restaurant's setup?"
        description="Send an enquiry and our team will prepare a tailored plan."
        primary={{ label: "Request a Quote", href: routes.marketing.contact(), icon: "ArrowRight" }}
        secondary={{ label: "View Demo", href: routes.restaurant.home("pizza-house") }}
      />
    </>
  );
}
