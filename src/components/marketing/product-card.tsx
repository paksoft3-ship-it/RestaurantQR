import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  description: string;
  icon: string;
  category: string;
  image: string;
  badge?: string;
  className?: string;
}

/**
 * QR/NFC hardware product card. Showcase only — no purchase or cart controls.
 */
export function ProductCard({
  name,
  description,
  icon,
  category,
  image,
  badge,
  className,
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[16px] border border-border bg-canvas shadow-card transition-shadow hover:shadow-lift",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <Image src={image} alt={name} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
        {badge ? (
          <Badge intent="primary" className="absolute left-3 top-3">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center gap-2 text-small font-semibold text-text-tertiary">
          <Icon name={icon} className="size-4 text-primary" aria-hidden />
          <span>{category}</span>
        </div>
        <h3 className="font-heading text-h3 font-bold text-text-primary">{name}</h3>
        <p className="text-small text-text-secondary">{description}</p>
      </div>
    </article>
  );
}
