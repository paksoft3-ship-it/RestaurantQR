import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface HeroCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline" | "dark" | "ghost";
  icon?: string;
}

interface HeroImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface HeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
  trustItems?: { icon: string; label: string }[];
  image?: HeroImage;
  /** Decorative slot rendered in place of an image (e.g. phone previews). */
  visual?: React.ReactNode;
  tone?: "default" | "warm";
  className?: string;
}

/** Marketing hero with eyebrow, headline, CTAs and an optional visual. */
export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  trustItems,
  image,
  visual,
  tone = "default",
  className,
}: HeroProps) {
  const hasVisual = Boolean(image || visual);
  return (
    <section
      className={cn(
        "py-16 md:py-24",
        tone === "warm" ? "bg-surface-warm" : "bg-canvas",
        className,
      )}
    >
      <Container>
        <div
          className={cn(
            "grid items-center gap-12",
            hasVisual ? "lg:grid-cols-2" : "mx-auto max-w-3xl text-center",
          )}
        >
          <div className={cn("flex flex-col gap-6", !hasVisual && "items-center")}>
            {eyebrow ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-surface-warm px-3 py-1 font-body text-small font-bold uppercase tracking-wide text-primary">
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                {eyebrow}
              </span>
            ) : null}
            <h1 className="font-display text-h1 text-text-primary md:text-display">{title}</h1>
            {description ? (
              <p className={cn("text-body text-text-secondary", !hasVisual && "max-w-2xl")}>
                {description}
              </p>
            ) : null}
            {(primaryCta || secondaryCta) && (
              <div className={cn("flex flex-wrap gap-3", !hasVisual && "justify-center")}>
                {primaryCta ? (
                  <Button asChild size="lg" variant={primaryCta.variant ?? "primary"}>
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      {primaryCta.icon ? <Icon name={primaryCta.icon} aria-hidden /> : null}
                    </Link>
                  </Button>
                ) : null}
                {secondaryCta ? (
                  <Button asChild size="lg" variant={secondaryCta.variant ?? "outline"}>
                    <Link href={secondaryCta.href}>
                      {secondaryCta.icon ? <Icon name={secondaryCta.icon} aria-hidden /> : null}
                      {secondaryCta.label}
                    </Link>
                  </Button>
                ) : null}
              </div>
            )}
            {trustItems?.length ? (
              <ul className={cn("flex flex-wrap gap-x-6 gap-y-2", !hasVisual && "justify-center")}>
                {trustItems.map((item) => (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-2 text-small font-semibold text-text-secondary"
                  >
                    <Icon name={item.icon} className="size-4 text-success" aria-hidden />
                    {item.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {image ? (
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[20px] border border-border bg-surface shadow-lift">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="h-auto w-full"
                priority
              />
            </div>
          ) : null}
          {visual ?? null}
        </div>
      </Container>
    </section>
  );
}
