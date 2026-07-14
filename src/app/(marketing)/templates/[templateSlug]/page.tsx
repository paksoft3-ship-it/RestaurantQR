import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { slugify, titleCase } from "@/lib/utils";
import type { Template } from "@/domain/entities";

interface PageProps {
  params: Promise<{ templateSlug: string }>;
}

const INCLUDED = [
  { icon: "Store", text: "Branded restaurant homepage with your four key actions" },
  { icon: "BookOpen", text: "Full digital menu — categories, prices, photos, dietary labels" },
  { icon: "QrCode", text: "Custom QR codes and NFC products that open this page" },
  { icon: "ShoppingBag", text: "External ordering link, maps, directions and opening hours" },
  { icon: "Languages", text: "Multi-language support tailored to your guests" },
  { icon: "RefreshCw", text: "Fully managed setup and ongoing updates by our team" },
];

async function findTemplate(slug: string): Promise<Template | null> {
  const templates = await getRepositories().content.templates();
  return templates.find((t) => slugify(t.name) === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { templateSlug } = await params;
  const template = await findTemplate(templateSlug);
  if (!template) return { title: "Template not found" };
  return {
    title: `${template.name} — Restaurant Template`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { templateSlug } = await params;
  const template = await findTemplate(templateSlug);
  if (!template) notFound();

  // A published restaurant in the same visual direction, to preview it live.
  const { items } = await getRepositories().restaurants.list({
    publishingStatus: "published",
    pageSize: 50,
  });
  const liveExample = items.find((r) => r.visualDirection === template.direction) ?? null;

  return (
    <div className="pb-20">
      <section className="border-b border-border bg-surface py-6">
        <Container>
          <Link
            href={routes.marketing.templates()}
            className="inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            <Icon name="ArrowLeft" className="size-4" aria-hidden />
            All templates
          </Link>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            {/* Preview */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
              {template.image ? (
                <Image
                  src={template.image}
                  alt={`${template.name} visual direction preview`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-warm to-surface">
                  <Icon name="Palette" className="size-12 text-primary/40" aria-hidden />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-5">
              <p className="text-small font-bold uppercase tracking-wide text-primary">
                {titleCase(template.direction)} direction
              </p>
              <h1 className="font-display text-h1 text-text-primary md:text-display">{template.name}</h1>
              <p className="text-body text-text-secondary">{template.description}</p>
              <p className="inline-flex items-center gap-2 text-small font-semibold text-primary">
                <Icon name="Sparkles" className="size-4" aria-hidden />
                Best for: {template.bestFor}
              </p>

              <div className="mt-2 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href={`${routes.marketing.contact()}?design=${encodeURIComponent(template.name)}`}>
                    <Icon name="ArrowRight" className="size-4" aria-hidden />
                    Request this design
                  </Link>
                </Button>
                {liveExample ? (
                  <Button asChild size="lg" variant="outline">
                    <Link href={routes.restaurant.home(liveExample.slug)} target="_blank" rel="noreferrer">
                      <Icon name="Eye" className="size-4" aria-hidden />
                      See it live
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* What's included */}
      <section className="border-t border-border bg-surface py-14">
        <Container>
          <h2 className="font-heading text-h2 font-bold text-text-primary">What&apos;s included</h2>
          <p className="mt-2 max-w-2xl text-small text-text-secondary">
            Every direction is delivered as a fully managed build — we tailor it to your brand,
            colours and photography. You never log in or manage software.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li
                key={item.text}
                className="flex items-start gap-3 rounded-[16px] border border-border bg-canvas p-5 shadow-card"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
                  <Icon name={item.icon} className="size-5" aria-hidden />
                </span>
                <span className="text-small text-text-primary">{item.text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-14">
        <Container>
          <div className="flex flex-col items-start gap-4 rounded-[20px] border border-border bg-canvas p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-h3 font-bold text-text-primary">
                Want your restaurant in the {template.name} style?
              </h2>
              <p className="mt-1 text-small text-text-secondary">
                Tell us about your restaurant and we&apos;ll tailor this direction in your quote.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href={`${routes.marketing.contact()}?design=${encodeURIComponent(template.name)}`}>
                Request this design
                <Icon name="ArrowRight" className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
