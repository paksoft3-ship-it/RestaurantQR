import { describe, it, expect } from "vitest";
import { computeSnapshot, computeView, type EventRow } from "./compute";

const NOW = Date.parse("2026-07-14T12:00:00.000Z");
const iso = (daysAgo: number) => new Date(NOW - daysAgo * 86_400_000).toISOString();

const rows: EventRow[] = [
  { type: "page_view", channel: "qr", actionType: null, target: null, createdAt: iso(1) },
  { type: "page_view", channel: "qr", actionType: null, target: null, createdAt: iso(2) },
  { type: "page_view", channel: "nfc", actionType: null, target: null, createdAt: iso(1) },
  { type: "menu_view", channel: "direct", actionType: null, target: null, createdAt: iso(1) },
  { type: "product_view", channel: "direct", actionType: null, target: "pepperoni", createdAt: iso(3) },
  { type: "product_view", channel: "direct", actionType: null, target: "pepperoni", createdAt: iso(3) },
  { type: "action_click", channel: null, actionType: "call-order", target: null, createdAt: iso(1) },
  { type: "action_click", channel: null, actionType: "visit-us", target: null, createdAt: iso(2) },
  // Outside the 30-day window — must be excluded.
  { type: "page_view", channel: "qr", actionType: null, target: null, createdAt: iso(45) },
];

describe("computeSnapshot", () => {
  it("counts scans/taps/menu views/action clicks within the window", () => {
    const s = computeSnapshot(rows, NOW, 30);
    expect(s.totalScans).toBe(2); // two qr within 30d (the 45-day one excluded)
    expect(s.totalTaps).toBe(1);
    expect(s.menuViews).toBe(3); // 1 menu_view + 2 product_view
    expect(s.actionClicks).toBe(2);
    expect(s.series).toHaveLength(14);
    expect(s.series.reduce((n, p) => n + p.value, 0)).toBeGreaterThan(0);
  });

  it("excludes events older than the range", () => {
    const s = computeSnapshot(rows, NOW, 7);
    expect(s.totalScans).toBe(2);
    const all = computeSnapshot(rows, NOW, 60);
    expect(all.totalScans).toBe(3); // now includes the 45-day-old qr
  });
});

describe("computeView", () => {
  it("builds channel split, action breakdown and top products", () => {
    const v = computeView(rows, NOW, 30);
    expect(v.channelSplit.qr).toBe(2);
    expect(v.channelSplit.nfc).toBe(1);
    expect(v.channelSplit.direct).toBe(3); // 1 menu_view + 2 product_view (action_click channel is null → direct)
    expect(v.actionBreakdown).toEqual(
      expect.arrayContaining([
        { label: "call-order", value: 1 },
        { label: "visit-us", value: 1 },
      ]),
    );
    expect(v.topTargets[0]).toEqual({ label: "pepperoni", value: 2 });
  });
});
