import Link from "next/link";
import type { Campaign } from "@/domain/entities";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { Icon } from "@/components/shared/icon";

interface CampaignCardProps {
  restaurantSlug: string;
  campaign: Campaign;
}

/**
 * Promo banner linking to a Scan & Win campaign. Warm orange/red surface with a
 * yellow accent badge — short, high-impact copy, no gambling visuals.
 */
export function CampaignCard({ restaurantSlug, campaign }: CampaignCardProps) {
  const title = resolveText(campaign.localizedTitle, "en");
  const description = resolveText(campaign.localizedDescription, "en");

  return (
    <Link
      href={routes.restaurant.campaign(restaurantSlug, campaign.slug)}
      className="group relative block overflow-hidden rounded-[20px] bg-primary p-6 text-white shadow-card transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[12px] bg-accent text-navy">
            <Icon name="QrCode" className="size-6" aria-hidden />
          </span>
          <h2 className="font-heading text-h2 font-bold">{title}</h2>
        </div>
        {description ? (
          <p className="mb-5 max-w-[90%] text-small leading-relaxed text-white/90">
            {description}
          </p>
        ) : null}
        <span className="inline-flex items-center gap-2 rounded-[12px] bg-white px-5 py-2.5 text-button font-bold text-primary shadow-card transition-all group-hover:gap-3">
          Reveal today&apos;s reward
          <Icon name="ArrowRight" className="size-4" aria-hidden />
        </span>
      </div>
      <Icon
        name="UtensilsCrossed"
        className="pointer-events-none absolute -bottom-6 -right-6 size-44 rotate-12 text-white/10"
        aria-hidden
      />
    </Link>
  );
}
