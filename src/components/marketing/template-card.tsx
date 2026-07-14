import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  name: string;
  description: string;
  bestFor: string;
  image: string | null;
  /** When set, the whole card links to the template's detail page. */
  href?: string;
  className?: string;
}

/**
 * Managed visual-direction card for the templates gallery. Directions are
 * starting points configured by the team — not self-service themes. When `href`
 * is provided the card becomes a link to the template's detail page.
 */
export function TemplateCard({ name, description, bestFor, image, href, className }: TemplateCardProps) {
  const inner = (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image}
            alt={`${name} visual direction`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-warm to-surface">
            <Icon name="Palette" className="size-8 text-primary/40" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-h3 font-bold text-text-primary">{name}</h3>
        <p className="text-small text-text-secondary">{description}</p>
        <p className="mt-auto inline-flex items-center gap-2 text-small font-semibold text-primary">
          <Icon name="Sparkles" className="size-4" aria-hidden />
          Best for: {bestFor}
        </p>
        {href ? (
          <span className="inline-flex items-center gap-1 text-small font-bold text-primary">
            View direction
            <Icon
              name="ArrowRight"
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
    </>
  );

  const base = cn(
    "flex h-full flex-col overflow-hidden rounded-[16px] border border-border bg-canvas shadow-card transition-shadow",
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        )}
        aria-label={`${name} — view direction`}
      >
        {inner}
      </Link>
    );
  }

  return <article className={cn(base, "hover:shadow-lift")}>{inner}</article>;
}
