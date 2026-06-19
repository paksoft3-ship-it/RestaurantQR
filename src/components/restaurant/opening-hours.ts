import type { OpeningHours } from "@/domain/entities";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/domain/enums";

/** Map a JS `Date.getDay()` (0=Sunday) to our DayOfWeek vocabulary. */
const JS_DAY_TO_DAY: Record<number, DayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export interface OpenState {
  /** Whether the restaurant is currently open. */
  isOpen: boolean;
  /** Today's matching record (if hours are configured). */
  today: OpeningHours | null;
  todayKey: DayOfWeek;
  /** First period of today, formatted "HH:mm – HH:mm" when open today. */
  todayRange: string | null;
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return Number.NaN;
  return h * 60 + m;
}

/**
 * Derive an open/closed state from configured opening hours.
 *
 * Pure and deterministic given `now` so it is safe in server components.
 * When no hours are configured we report closed but with `today` null so the
 * UI can show a "hours to be confirmed" state instead of a fake status.
 */
export function getOpenState(hours: OpeningHours[], now: Date = new Date()): OpenState {
  const todayKey = JS_DAY_TO_DAY[now.getDay()];
  const today = hours.find((h) => h.day === todayKey) ?? null;

  if (!today || today.status === "closed" || today.periods.length === 0) {
    return { isOpen: false, today, todayKey, todayRange: null };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isOpen = today.periods.some((period) => {
    const open = minutesOf(period.open);
    const close = minutesOf(period.close);
    if (Number.isNaN(open) || Number.isNaN(close)) return false;
    // Handle ranges that cross midnight (e.g. 18:00 – 00:30).
    if (close <= open) {
      return nowMinutes >= open || nowMinutes < close;
    }
    return nowMinutes >= open && nowMinutes < close;
  });

  const first = today.periods[0];
  const todayRange = first ? `${first.open} – ${first.close}` : null;

  return { isOpen, today, todayKey, todayRange };
}

/** Order hours Monday → Sunday for display. */
export function orderedHours(hours: OpeningHours[]): OpeningHours[] {
  return [...hours].sort(
    (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day),
  );
}

/** Format a single day's periods as readable text. */
export function formatPeriods(record: OpeningHours): string {
  if (record.status === "closed" || record.periods.length === 0) return "Closed";
  return record.periods.map((p) => `${p.open} – ${p.close}`).join(", ");
}
