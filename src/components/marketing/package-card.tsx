import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  name: string;
  summary: string;
  features: string[];
  ctaHref: string;
  ctaLabel?: string;
  highlighted?: boolean;
  badge?: string;
  className?: string;
}

/**
 * Package card. Shows a "Request a Quote" CTA — never invented prices, since
 * pricing is custom-tailored by the managed service.
 */
export function PackageCard({
  name,
  summary,
  features,
  ctaHref,
  ctaLabel = "Request a Quote",
  highlighted = false,
  badge,
  className,
}: PackageCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col gap-5 rounded-[20px] border bg-canvas p-7 shadow-card",
        highlighted ? "border-primary ring-1 ring-primary" : "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-h2 font-bold text-text-primary">{name}</h3>
        </div>
        {badge ? <Badge intent="primary">{badge}</Badge> : null}
      </div>
      <p className="text-small text-text-secondary">{summary}</p>
      <p className="text-small font-semibold text-text-tertiary">Custom-tailored pricing</p>
      <ul className="flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-small text-text-primary">
            <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant={highlighted ? "primary" : "outline"} size="lg" className="w-full">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </article>
  );
}
