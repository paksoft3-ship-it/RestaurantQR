"use server";

import { and, eq, gte } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/data/db/client";
import { requireAdminUser } from "@/lib/auth";
import { computeView, type AnalyticsView, type EventRow } from "./compute";

const DAY_MS = 86_400_000;

async function loadRows(restaurantId: string | undefined, days: number): Promise<EventRow[]> {
  if (!isDatabaseConfigured()) return [];
  const cutoff = new Date(Date.now() - days * DAY_MS).toISOString();
  const cols = {
    type: schema.events.type,
    channel: schema.events.channel,
    actionType: schema.events.actionType,
    target: schema.events.target,
    createdAt: schema.events.createdAt,
  };
  const where = restaurantId
    ? and(eq(schema.events.restaurantId, restaurantId), gte(schema.events.createdAt, cutoff))
    : gte(schema.events.createdAt, cutoff);
  return getDb().select(cols).from(schema.events).where(where);
}

/** Real analytics for a single restaurant over the last `days` (admin-gated). */
export async function getRestaurantAnalytics(restaurantId: string, days = 30): Promise<AnalyticsView> {
  await requireAdminUser();
  return computeView(await loadRows(restaurantId, days), Date.now(), days);
}

/** Real platform-wide analytics over the last `days` (admin-gated). */
export async function getPlatformAnalytics(days = 30): Promise<AnalyticsView> {
  await requireAdminUser();
  return computeView(await loadRows(undefined, days), Date.now(), days);
}

export interface RestaurantBreakdownRow {
  restaurantId: string;
  scans: number;
  taps: number;
  menuViews: number;
  actionClicks: number;
  total: number;
}

/** Per-restaurant interaction totals over the last `days` (admin-gated). */
export async function getPlatformRestaurantBreakdown(days = 30): Promise<RestaurantBreakdownRow[]> {
  await requireAdminUser();
  if (!isDatabaseConfigured()) return [];
  const cutoff = new Date(Date.now() - days * DAY_MS).toISOString();
  const rows = await getDb()
    .select({
      restaurantId: schema.events.restaurantId,
      type: schema.events.type,
      channel: schema.events.channel,
    })
    .from(schema.events)
    .where(gte(schema.events.createdAt, cutoff));

  const map = new Map<string, RestaurantBreakdownRow>();
  for (const r of rows) {
    const cur =
      map.get(r.restaurantId) ??
      { restaurantId: r.restaurantId, scans: 0, taps: 0, menuViews: 0, actionClicks: 0, total: 0 };
    if (r.channel === "qr") cur.scans += 1;
    if (r.channel === "nfc") cur.taps += 1;
    if (r.type === "menu_view" || r.type === "product_view") cur.menuViews += 1;
    if (r.type === "action_click") cur.actionClicks += 1;
    cur.total += 1;
    map.set(r.restaurantId, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
