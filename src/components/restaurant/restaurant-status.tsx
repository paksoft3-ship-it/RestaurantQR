import type { OpeningHours } from "@/domain/entities";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { getOpenState } from "./opening-hours";

interface RestaurantStatusProps {
  hours: OpeningHours[];
  className?: string;
  /** Use a light treatment for placement over imagery. */
  onImage?: boolean;
}

/**
 * Open / closed indicator derived from opening hours. Status is always paired
 * with an icon + text label, never color alone.
 */
export function RestaurantStatus({ hours, className, onImage = false }: RestaurantStatusProps) {
  const { isOpen, todayRange } = getOpenState(hours);
  const hasHours = hours.length > 0;

  if (!hasHours) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          onImage
            ? "bg-black/40 text-white backdrop-blur-sm"
            : "bg-surface-container text-text-secondary",
          className,
        )}
      >
        <Icon name="Clock" className="size-3.5" aria-hidden />
        Hours to be confirmed
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        isOpen
          ? onImage
            ? "bg-success/90 text-white backdrop-blur-sm"
            : "bg-success/10 text-success"
          : onImage
            ? "bg-black/50 text-white backdrop-blur-sm"
            : "bg-danger/10 text-danger",
        className,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          isOpen ? "bg-current" : "bg-current",
        )}
        aria-hidden
      />
      {isOpen ? "Open now" : "Closed"}
      {isOpen && todayRange ? (
        <span className="font-medium normal-case opacity-90"> · {todayRange}</span>
      ) : null}
    </span>
  );
}
