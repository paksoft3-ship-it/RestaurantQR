import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Icon } from "@/components/shared/icon";
import { restaurantMetadata } from "../../../metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string; campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug, campaignSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  const campaign = await repos.campaigns.getBySlug(restaurant.id, campaignSlug);
  if (!campaign) return {};
  const title = resolveText(campaign.localizedTitle, "en");
  return restaurantMetadata(restaurant, {
    title: `${title} — Terms · ${restaurant.displayName || restaurant.name}`,
    description: `Campaign terms and reward rules for ${title}.`,
  });
}

const TBC = "To be confirmed";

export default async function CampaignTermsPage({ params }: PageProps) {
  const { restaurantSlug, campaignSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const campaign = await repos.campaigns.getBySlug(restaurant.id, campaignSlug);
  if (!campaign) notFound();

  const title = resolveText(campaign.localizedTitle, "en");
  const rewardTitle = resolveText(campaign.reward.title, "en");
  const rewardDescription = resolveText(campaign.reward.description, "en");
  const organizer = campaign.organizer ?? restaurant.legalName ?? restaurant.displayName ?? restaurant.name;

  const glance: { label: string; value: string }[] = [
    { label: "Organizer", value: organizer || TBC },
    {
      label: "Campaign period",
      value:
        campaign.startDate || campaign.endDate
          ? `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`
          : TBC,
    },
    {
      label: "Claim deadline",
      value: campaign.claimDeadline ? formatDate(campaign.claimDeadline) : TBC,
    },
    { label: "Terms version", value: campaign.termsVersion || TBC },
  ];

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-shell">
        <Link
          href={routes.restaurant.campaign(restaurant.slug, campaign.slug)}
          className="mb-4 inline-flex items-center gap-1.5 text-button font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Icon name="ArrowLeft" className="size-4" aria-hidden />
          Back to campaign
        </Link>

        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <Icon name="Scale" className="size-4" aria-hidden />
          Campaign terms &amp; conditions
        </span>

        <h1 className="mt-4 font-display text-h1 font-extrabold tracking-tight text-text-primary">
          {title} — rules &amp; details
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {glance.map((item) => (
            <div
              key={item.label}
              className="rounded-[16px] border border-border bg-canvas p-4 shadow-card"
            >
              <dt className="text-small text-text-secondary">{item.label}</dt>
              <dd className="mt-1 font-heading text-body font-bold text-text-primary">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-6">
          <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <h2 className="border-b border-border pb-2 font-heading text-h2 font-bold text-text-primary">
              1. Campaign organizer
            </h2>
            <p className="mt-3 text-body text-text-secondary">
              This promotional campaign is organized and operated by {organizer || TBC}. Any
              organizer contact details not shown here are to be confirmed.
            </p>
          </section>

          <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <h2 className="border-b border-border pb-2 font-heading text-h2 font-bold text-text-primary">
              2. Campaign period
            </h2>
            <p className="mt-3 text-body text-text-secondary">
              {campaign.startDate || campaign.endDate
                ? `The campaign runs from ${formatDate(campaign.startDate)} to ${formatDate(
                    campaign.endDate,
                  )}. Participation outside this period is not eligible.`
                : "The campaign period is to be confirmed."}
            </p>
          </section>

          <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <h2 className="border-b border-border pb-2 font-heading text-h2 font-bold text-text-primary">
              3. Eligibility
            </h2>
            <p className="mt-3 text-body text-text-secondary">
              {campaign.eligibility ?? "Eligibility details are to be confirmed."}
            </p>
          </section>

          <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <h2 className="border-b border-border pb-2 font-heading text-h2 font-bold text-text-primary">
              4. How to participate
            </h2>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-body text-text-secondary">
              <li>Visit {restaurant.displayName || restaurant.name} during the campaign period.</li>
              <li>Scan the official campaign QR code or tap the NFC tag in-store.</li>
              <li>Reveal your reward and show this screen to staff when you order.</li>
            </ol>
            {campaign.attemptRules ? (
              <p className="mt-3 text-small text-text-secondary">{campaign.attemptRules}</p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <h2 className="border-b border-border pb-2 font-heading text-h2 font-bold text-text-primary">
              5. Available reward
            </h2>
            <p className="mt-3 text-body text-text-secondary">
              <span className="font-semibold text-text-primary">{rewardTitle}</span>
              {campaign.reward.value ? ` — ${campaign.reward.value}` : ""}.
            </p>
            {rewardDescription ? (
              <p className="mt-2 text-body text-text-secondary">{rewardDescription}</p>
            ) : null}
            {campaign.claimDeadline ? (
              <p className="mt-2 text-small text-text-secondary">
                Rewards must be claimed by {formatDate(campaign.claimDeadline)}.
              </p>
            ) : null}
          </section>

          <section className="rounded-[16px] border border-border bg-surface p-5">
            <h2 className="font-heading text-h3 font-bold text-text-primary">
              No purchase of attempts
            </h2>
            <p className="mt-2 text-small text-text-secondary">
              This is a simple thank-you offer. There is no gambling, no paid attempts and no
              customer account required. Rewards are fixed and revealed in a single tap.
            </p>
          </section>
        </div>
      </div>
    </Container>
  );
}
