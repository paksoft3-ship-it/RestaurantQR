"use client";

import { useState } from "react";
import type { CampaignReward } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { Icon } from "@/components/shared/icon";
import { RewardCard } from "./reward-card";

interface CampaignRevealProps {
  reward: CampaignReward;
  claimDeadline?: string | null;
  /** Whether the campaign is currently active and rewards can be revealed. */
  active: boolean;
}

/**
 * Tasteful, single-tap reward reveal. No wheels, slots, countdowns or paid
 * attempts — the reward is fixed and simply revealed. Before the tap we show a
 * gift prompt; after, the configured reward and claim instructions.
 */
export function CampaignReveal({ reward, claimDeadline, active }: CampaignRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const title = resolveText(reward.title, "en");

  if (!active) {
    return (
      <div className="rounded-[20px] border border-border bg-canvas p-6 text-center shadow-card">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface-container text-text-secondary">
          <Icon name="Clock" className="size-8" aria-hidden />
        </span>
        <h2 className="mt-3 font-heading text-h3 font-bold text-text-primary">
          This reward isn&apos;t available right now
        </h2>
        <p className="mt-1 text-small text-text-secondary">
          The campaign is not currently active. Please check back during the campaign period.
        </p>
      </div>
    );
  }

  if (revealed) {
    return <RewardCard reward={reward} claimDeadline={claimDeadline} />;
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-border bg-canvas p-6 text-center shadow-card">
      <span className="absolute inset-x-0 top-0 h-1.5 bg-primary" aria-hidden />
      <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-surface-warm text-primary">
        <Icon name="Gift" className="size-10" aria-hidden />
      </span>
      <h2 className="mt-4 font-heading text-h3 font-bold text-text-primary">Tap to reveal</h2>
      <p className="mt-1 text-small text-text-secondary">
        A special offer is waiting for you.
      </p>
      <button
        type="button"
        onClick={() => setRevealed(true)}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-button font-bold text-white shadow-card transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Reveal my reward
        <Icon name="ArrowRight" className="size-5" aria-hidden />
      </button>
      <p className="sr-only">The reward you will receive is: {title}.</p>
    </div>
  );
}
