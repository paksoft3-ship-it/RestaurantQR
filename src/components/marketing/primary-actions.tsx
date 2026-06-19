import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface PrimaryAction {
  icon: string;
  title: string;
  description: string;
  tone: "primary" | "dark" | "default" | "warm";
  /** Optional column span on large screens. */
  span?: 1 | 2;
}

const toneStyles: Record<PrimaryAction["tone"], string> = {
  primary: "bg-primary text-white",
  dark: "bg-navy text-white",
  default: "bg-canvas border border-border text-text-primary",
  warm: "bg-surface-warm text-text-primary",
};

/**
 * The four primary restaurant actions presented as a bento grid:
 * Call Order, Pick Your Meal, Online Order with Pay, Visit Us.
 */
export function PrimaryActions({ actions }: { actions: PrimaryAction[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const inverted = action.tone === "primary" || action.tone === "dark";
        return (
          <div
            key={action.title}
            className={cn(
              "flex flex-col gap-3 rounded-[16px] p-6 shadow-card",
              toneStyles[action.tone],
              action.span === 2 && "lg:col-span-2",
            )}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-[12px]",
                inverted ? "bg-white/15 text-white" : "bg-surface-warm text-primary",
              )}
            >
              <Icon name={action.icon} className="size-6" aria-hidden />
            </span>
            <h3 className="font-heading text-h3 font-bold">{action.title}</h3>
            <p className={cn("text-small", inverted ? "text-white/80" : "text-text-secondary")}>
              {action.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
