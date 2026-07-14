import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/data/db/client";
import { events } from "@/data/db/schema";

export const runtime = "nodejs";

const EVENT_TYPES = new Set(["page_view", "menu_view", "product_view", "action_click"]);
const CHANNELS = new Set(["qr", "nfc", "direct"]);

/**
 * Public interaction-tracking ingest. Records one analytics event per call.
 * Never throws to the caller (analytics must not break the page) and is a no-op
 * when no database is configured. No PII is stored — only coarse interaction
 * metadata used for aggregate counts.
 */
export async function POST(request: Request) {
  try {
    if (!isDatabaseConfigured()) return new NextResponse(null, { status: 204 });

    const body = (await request.json().catch(() => null)) as
      | {
          restaurantId?: unknown;
          type?: unknown;
          channel?: unknown;
          actionType?: unknown;
          target?: unknown;
        }
      | null;

    const restaurantId = typeof body?.restaurantId === "string" ? body.restaurantId.slice(0, 128) : "";
    const type = typeof body?.type === "string" ? body.type : "";
    if (!restaurantId || !EVENT_TYPES.has(type)) {
      return new NextResponse(null, { status: 204 });
    }

    const channelRaw = typeof body?.channel === "string" ? body.channel : null;
    const channel = channelRaw && CHANNELS.has(channelRaw) ? channelRaw : null;
    const actionType = typeof body?.actionType === "string" ? body.actionType.slice(0, 64) : null;
    const target = typeof body?.target === "string" ? body.target.slice(0, 256) : null;

    await getDb()
      .insert(events)
      .values({
        id: `ev_${randomUUID()}`,
        restaurantId,
        type,
        channel,
        actionType,
        target,
        createdAt: new Date().toISOString(),
      });

    return new NextResponse(null, { status: 204 });
  } catch {
    // Swallow — tracking failures must never surface to visitors.
    return new NextResponse(null, { status: 204 });
  }
}
