import Image from "next/image";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  name: string;
  description: string;
  bestFor: string;
  image: string;
  className?: string;
}

/**
 * Managed visual-direction card for the templates gallery. Directions are
 * starting points configured by the team — not self-service themes.
 */
export function TemplateCard({ name, description, bestFor, image, className }: TemplateCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[16px] border border-border bg-canvas shadow-card transition-shadow hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
        <Image src={image} alt={`${name} visual direction`} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-h3 font-bold text-text-primary">{name}</h3>
        <p className="text-small text-text-secondary">{description}</p>
        <p className="mt-auto inline-flex items-center gap-2 text-small font-semibold text-primary">
          <Icon name="Sparkles" className="size-4" aria-hidden />
          Best for: {bestFor}
        </p>
      </div>
    </article>
  );
}
