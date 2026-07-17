import Image from "next/image";
import Link from "next/link";
import type { CustomerAction, MenuProduct } from "@/domain/entities";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { formatPrice, cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { resolveActionLink } from "./action-link";

interface ProductDetailProps {
  restaurantSlug: string;
  product: MenuProduct;
  /** Configured customer actions, used for Call Order + Online Order links. */
  actions: CustomerAction[];
}

/**
 * Product detail content: image, identity, price, description, variants,
 * dietary/allergen info and the two appropriate actions (Call Order + external
 * Online Order). No add-to-cart — this is a digital menu, not a checkout.
 */
export function ProductDetail({ restaurantSlug, product, actions }: ProductDetailProps) {
  const name = resolveText(product.localizedName, "en");
  const description = resolveText(product.localizedDescription, "en");
  const imageSrc =
    product.image && (product.image.startsWith("/") || product.image.startsWith("http"))
      ? product.image
      : "/placeholders/food.svg";

  const callAction = actions.find((a) => a.enabled && a.type === "call-order");
  const onlineAction = actions.find((a) => a.enabled && a.type === "online-order");
  const callLink = callAction ? resolveActionLink(callAction) : null;
  const onlineLink = onlineAction ? resolveActionLink(onlineAction) : null;

  return (
    <article className="flex flex-col">
      <Link
        href={routes.restaurant.menu(restaurantSlug)}
        className="mb-4 inline-flex items-center gap-1.5 text-button font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Icon name="ArrowLeft" className="size-4" aria-hidden />
        Back to menu
      </Link>

      <div className="relative h-[260px] w-full overflow-hidden rounded-[16px] border border-border bg-surface-container">
        <Image
          src={imageSrc}
          alt={name}
          width={640}
          height={260}
          priority
          className="size-full object-cover"
        />
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 text-small text-text-secondary">
          {product.availability !== "available" ? (
            <StatusBadge group="availability" value={product.availability} />
          ) : (
            <span className="inline-flex items-center gap-1.5 text-success">
              <Icon name="CheckCircle2" className="size-4" aria-hidden />
              Available
            </span>
          )}
        </div>

        <h1 className="mt-2 font-display text-h1 font-extrabold tracking-tight text-text-primary">
          {name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {product.featured ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-small font-semibold text-primary">
              Popular
            </span>
          ) : null}
          {product.dietaryLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-success/10 px-3 py-1 text-small font-semibold text-success"
            >
              {label}
            </span>
          ))}
        </div>

        <p className="mt-4 font-heading text-h2 font-bold text-primary">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>

      {description ? (
        <section className="mt-6">
          <h2 className="font-heading text-h3 font-bold text-text-primary">About this dish</h2>
          <p className="mt-2 text-body text-text-secondary">{description}</p>
        </section>
      ) : null}

      {product.variants.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-heading text-h3 font-bold text-text-primary">Available sizes</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {product.variants.map((variant) => (
              <li
                key={variant.id}
                className="flex flex-col rounded-[12px] border border-border bg-canvas p-4"
              >
                <span className="text-body font-semibold text-text-primary">{variant.label}</span>
                <span className="mt-1 text-body text-text-secondary">
                  {formatPrice(product.price + variant.priceModifier, product.currency)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {product.allergenNote ? (
        <section className="mt-6 rounded-[16px] border border-outline-variant bg-surface-warm p-4">
          <h2 className="flex items-center gap-2 font-heading text-body font-bold text-primary-dark">
            <Icon name="Info" className="size-5" aria-hidden />
            Dietary &amp; allergen information
          </h2>
          <p className="mt-2 text-small text-text-secondary">{product.allergenNote}</p>
          {callLink?.href ? (
            <a
              href={callLink.href}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-primary px-4 text-button font-bold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Icon name="Phone" className="size-5" aria-hidden />
              Call for allergen details
            </a>
          ) : null}
        </section>
      ) : null}

      <section className="mt-6 flex flex-col gap-3">
        {onlineLink?.href ? (
          <a
            href={onlineLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-button font-bold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Online Order with Pay
            <Icon name="ExternalLink" className="size-5" aria-hidden />
          </a>
        ) : null}
        {callLink?.href ? (
          <a
            href={callLink.href}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-navy px-5 text-button font-bold text-white transition-colors hover:bg-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon name="Phone" className="size-5" aria-hidden />
            Call Order
          </a>
        ) : null}
      </section>

      <div
        className={cn(
          "mt-8 flex items-center justify-between gap-3 rounded-[16px] border border-border bg-surface p-4",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <Icon name="UtensilsCrossed" className="size-5" aria-hidden />
          </span>
          <p className="font-heading text-body font-bold text-text-primary">Back to full menu</p>
        </div>
        <Link
          href={routes.restaurant.menu(restaurantSlug)}
          className="rounded-[10px] border border-border bg-canvas px-4 py-2 text-small font-bold text-text-primary transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          View menu
        </Link>
      </div>
    </article>
  );
}
