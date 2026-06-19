import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  hint?: string;
  /** Marks the figure as illustrative demo data. */
  demo?: boolean;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  intent?: "neutral" | "primary" | "success" | "warning";
  className?: string;
}

const INTENT_BG: Record<NonNullable<AdminMetricCardProps["intent"]>, string> = {
  neutral: "bg-surface-warm text-primary",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

const TREND_ICON: Record<NonNullable<AdminMetricCardProps["trend"]>["direction"], string> = {
  up: "TrendingUp",
  down: "TrendingDown",
  flat: "Minus",
};

/** Calm metric card for admin dashboards. */
export function AdminMetricCard({
  label,
  value,
  icon,
  hint,
  demo,
  trend,
  intent = "neutral",
  className,
}: AdminMetricCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-small font-medium text-text-secondary">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
              INTENT_BG[intent],
            )}
          >
            <Icon name={icon} className="size-5" aria-hidden />
          </span>
        ) : null}
      </div>
      <p className="font-display text-h1 leading-none text-text-primary">{value}</p>
      <div className="flex flex-wrap items-center gap-2">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              trend.direction === "up" && "text-success",
              trend.direction === "down" && "text-danger",
              trend.direction === "flat" && "text-text-secondary",
            )}
          >
            <Icon name={TREND_ICON[trend.direction]} className="size-3.5" aria-hidden />
            {trend.label}
          </span>
        ) : null}
        {hint ? <span className="text-xs text-text-secondary">{hint}</span> : null}
        {demo ? (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
            Demo Data
          </span>
        ) : null}
      </div>
    </div>
  );
}
