import type { CampaignReward } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";

interface RewardCardProps {
  reward: CampaignReward;
  /** ISO deadline by which the reward must be claimed. */
  claimDeadline?: string | null;
}

const REWARD_TYPE_LABEL: Record<CampaignReward["type"], string> = {
  discount: "Discount",
  "free-item": "Free item",
  points: "Loyalty points",
  voucher: "Voucher",
};

/**
 * Revealed reward result. Shows the configured reward, its value and claim
 * validity. Presentation only — the reveal interaction lives in the client
 * participation component.
 */
export function RewardCard({ reward, claimDeadline }: RewardCardProps) {
  const title = resolveText(reward.title, "en");
  const description = resolveText(reward.description, "en");

  return (
    <div className="overflow-hidden rounded-[20px] border border-success/30 bg-success/5">
      <div className="flex items-center gap-2 bg-success px-5 py-3 text-white">
        <Icon name="PartyPopper" className="size-5" aria-hidden />
        <span className="text-button font-bold">Reward unlocked</span>
      </div>
      <div className="space-y-4 p-5 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface-warm text-primary">
          <Icon name="Gift" className="size-8" aria-hidden />
        </span>
        <div>
          <span className="inline-block rounded-full bg-surface-container px-3 py-0.5 text-xs font-semibold text-text-secondary">
            {REWARD_TYPE_LABEL[reward.type]}
          </span>
          <h3 className="mt-2 font-heading text-h2 font-bold text-text-primary">{title}</h3>
          {reward.value ? (
            <p className="mt-1 text-body font-semibold text-primary">{reward.value}</p>
          ) : null}
          {description ? (
            <p className="mt-2 text-small text-text-secondary">{description}</p>
          ) : null}
        </div>

        <div className="rounded-[12px] border border-border bg-canvas p-4 text-left">
          <p className="flex items-center gap-2 text-small font-semibold text-text-primary">
            <Icon name="BadgeCheck" className="size-4 text-primary" aria-hidden />
            How to claim
          </p>
          <p className="mt-1 text-small text-text-secondary">
            Show this screen to a member of staff at the counter when you order. No screenshot,
            account or payment is required.
          </p>
          {claimDeadline ? (
            <p className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
              <Icon name="Clock" className="size-3.5" aria-hidden />
              Claim by {formatDate(claimDeadline)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
