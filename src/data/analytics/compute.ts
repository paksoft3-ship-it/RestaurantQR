import type { AnalyticsSnapshot } from "@/domain/repositories";

/** A single interaction event row (subset of the `events` table). */
export interface EventRow {
  type: string; // page_view | menu_view | product_view | action_click
  channel: string | null; // qr | nfc | direct
  actionType: string | null;
  target: string | null;
  createdAt: string; // ISO string
}

/** Rich analytics view model for the analytics pages. */
export interface AnalyticsView extends AnalyticsSnapshot {
  pageViews: number;
  totalEvents: number;
  channelSplit: { qr: number; nfc: number; direct: number };
  actionBreakdown: { label: string; value: number }[];
  topTargets: { label: string; value: number }[];
  rangeDays: number;
}

const DAY_MS = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

function dayLabel(ms: number): string {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** Daily totals for the last `points` days, oldest → newest. */
function buildDailySeries(
  rows: EventRow[],
  nowMs: number,
  points: number,
): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const t = Date.parse(r.createdAt);
    if (!Number.isFinite(t)) continue;
    const key = dayKey(t);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const series: { label: string; value: number }[] = [];
  for (let i = points - 1; i >= 0; i -= 1) {
    const ms = nowMs - i * DAY_MS;
    series.push({ label: dayLabel(ms), value: counts.get(dayKey(ms)) ?? 0 });
  }
  return series;
}

function withinDays(rows: EventRow[], nowMs: number, days: number): EventRow[] {
  const cutoff = nowMs - days * DAY_MS;
  return rows.filter((r) => {
    const t = Date.parse(r.createdAt);
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** Headline snapshot (dashboard + repo). Totals over `days`, 14-day daily series. */
export function computeSnapshot(rows: EventRow[], nowMs: number, days = 30): AnalyticsSnapshot {
  const recent = withinDays(rows, nowMs, days);
  return {
    totalScans: recent.filter((r) => r.channel === "qr").length,
    totalTaps: recent.filter((r) => r.channel === "nfc").length,
    menuViews: recent.filter((r) => r.type === "menu_view" || r.type === "product_view").length,
    actionClicks: recent.filter((r) => r.type === "action_click").length,
    series: buildDailySeries(recent, nowMs, 14),
  };
}

function topCounts(
  rows: EventRow[],
  key: (r: EventRow) => string | null,
  limit: number,
): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Full analytics view for a single restaurant or the platform. */
export function computeView(rows: EventRow[], nowMs: number, days = 30): AnalyticsView {
  const recent = withinDays(rows, nowMs, days);
  const snapshot = computeSnapshot(rows, nowMs, days);
  return {
    ...snapshot,
    pageViews: recent.filter((r) => r.type === "page_view").length,
    totalEvents: recent.length,
    // Arrival channel is only meaningful on view events (which always carry a
    // channel); action clicks have no channel and are excluded from the split.
    channelSplit: {
      qr: recent.filter((r) => r.channel === "qr").length,
      nfc: recent.filter((r) => r.channel === "nfc").length,
      direct: recent.filter((r) => r.channel === "direct").length,
    },
    actionBreakdown: topCounts(
      recent.filter((r) => r.type === "action_click"),
      (r) => r.actionType,
      8,
    ),
    topTargets: topCounts(
      recent.filter((r) => r.type === "product_view"),
      (r) => r.target,
      5,
    ),
    rangeDays: days,
  };
}
