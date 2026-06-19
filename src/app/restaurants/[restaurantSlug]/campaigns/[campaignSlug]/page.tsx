import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Icon } from "@/components/shared/icon";
import { CampaignReveal } from "@/components/restaurant/campaign-reveal";
import { restaurantMetadata } from "../../metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string; campaignSlug: string }>;
}

const HOW_IT_WORKS = [
  {
    title: "Open your reward",
    body: "Tap the reveal button to see the offer prepared for you.",
  },
  {
    title: "Show it at the counter",
    body: "Present this screen to a member of staff when you order.",
  },
  {
    title: "Enjoy your treat",
    body: "No screenshot, account or payment is required to claim.",
  },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug, campaignSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  const campaign = await repos.campaigns.getBySlug(restaurant.id, campaignSlug);
  if (!campaign) return {};

  const title = resolveText(campaign.localizedTitle, "en");
  const description = resolveText(campaign.localizedDescription, "en");
  return restaurantMetadata(restaurant, {
    title: `${title} · ${restaurant.displayName || restaurant.name}`,
    description: description || `${title} at ${restaurant.displayName || restaurant.name}.`,
  });
}

export default async function CampaignPage({ params }: PageProps) {
  const { restaurantSlug, campaignSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const campaign = await repos.campaigns.getBySlug(restaurant.id, campaignSlug);
  if (!campaign) notFound();

  const title = resolveText(campaign.localizedTitle, "en");
  const description = resolveText(campaign.localizedDescription, "en");
  const isActive = campaign.status === "active";

  return (
    <div>
      <section className="bg-primary px-5 py-10 text-center text-white">
        <div className="mx-auto max-w-shell">
          <span className="mx-auto flex size-24 items-center justify-center rounded-[20px] bg-accent text-navy shadow-card">
            <Icon name="QrCode" className="size-12" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-h1 font-extrabold tracking-tight">{title}</h1>
          {description ? <p className="mt-2 text-body text-white/90">{description}</p> : null}
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-small font-semibold uppercase tracking-wide backdrop-blur-sm">
            <Icon
              name={isActive ? "CheckCircle2" : "Clock"}
              className="size-4"
              aria-hidden
            />
            {isActive ? "Campaign active" : "Campaign not active"}
          </span>
        </div>
      </section>

      <Container className="max-w-shell py-8">
        <div className="mx-auto flex max-w-shell flex-col gap-8">
          <CampaignReveal
            reward={campaign.reward}
            claimDeadline={campaign.claimDeadline}
            active={isActive}
          />

          <section>
            <h2 className="mb-4 font-heading text-h3 font-bold text-text-primary">How it works</h2>
            <ol className="flex flex-col gap-4">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container font-bold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-body font-bold text-text-primary">
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-small text-text-secondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {campaign.eligibility ? (
            <section className="rounded-[16px] border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 font-heading text-h3 font-bold text-text-primary">
                <Icon name="BadgeCheck" className="size-5 text-primary" aria-hidden />
                Eligibility
              </h2>
              <p className="mt-2 text-small text-text-secondary">{campaign.eligibility}</p>
              {campaign.attemptRules ? (
                <p className="mt-2 text-small text-text-secondary">{campaign.attemptRules}</p>
              ) : null}
            </section>
          ) : null}

          {campaign.startDate || campaign.endDate || campaign.claimDeadline ? (
            <section className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-heading text-h3 font-bold text-text-primary">
                <Icon name="Clock" className="size-5 text-primary" aria-hidden />
                Validity
              </h2>
              <dl className="mt-3 flex flex-col gap-2 text-small">
                {campaign.startDate || campaign.endDate ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Campaign period</dt>
                    <dd className="text-right font-semibold text-text-primary">
                      {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
                    </dd>
                  </div>
                ) : null}
                {campaign.claimDeadline ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-secondary">Claim by</dt>
                    <dd className="text-right font-semibold text-text-primary">
                      {formatDate(campaign.claimDeadline)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <Link
            href={routes.restaurant.campaignTerms(restaurant.slug, campaign.slug)}
            className="inline-flex items-center gap-1.5 text-button font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon name="FileText" className="size-4" aria-hidden />
            Read the full campaign terms
          </Link>
        </div>
      </Container>
    </div>
  );
}
