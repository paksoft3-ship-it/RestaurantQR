import Image from "next/image";
import Link from "next/link";
import type { MenuProduct } from "@/domain/entities";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { formatPrice } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";

interface MenuProductCardProps {
  restaurantSlug: string;
  product: MenuProduct;
  /** Show a "Popular" flag for featured items. */
  showFeatured?: boolean;
}

/**
 * Image-led product card linking to the product detail page. No add-to-cart —
 * this is a digital menu, not a checkout.
 */
export function MenuProductCard({
  restaurantSlug,
  product,
  showFeatured = true,
}: MenuProductCardProps) {
  const name = resolveText(product.localizedName, "en");
  const description = resolveText(product.localizedDescription, "en");

  return (
    <Link
      href={routes.restaurant.product(restaurantSlug, product.slug)}
      className="group flex gap-4 rounded-[16px] border border-border bg-canvas p-3 shadow-card transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-[12px] bg-surface-container">
        <Image
          src="/placeholders/food.svg"
          alt={name}
          width={96}
          height={96}
          className="size-full object-cover"
        />
        {showFeatured && product.featured ? (
          <span className="absolute left-1 top-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Popular
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-[17px] font-bold text-text-primary">{name}</h3>
          </div>
          {description ? (
            <p className="mt-0.5 line-clamp-2 text-small text-text-secondary">{description}</p>
          ) : null}
          {product.dietaryLabels.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {product.dietaryLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-body text-body font-semibold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          <div className="flex items-center gap-2">
            {product.availability !== "available" ? (
              <StatusBadge group="availability" value={product.availability} />
            ) : null}
            <Icon
              name="ChevronRight"
              className="size-5 text-text-secondary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
