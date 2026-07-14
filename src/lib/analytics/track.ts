"use client";

import { loadConsent } from "@/lib/cookies/consent";

export interface TrackPayload {
  restaurantId: string;
  type: "page_view" | "menu_view" | "product_view" | "action_click";
  channel?: "qr" | "nfc" | "direct" | null;
  actionType?: string;
  target?: string;
}

/**
 * Record a public interaction event (consent-aware, non-blocking, no PII).
 * Only fires with Analytics consent; uses sendBeacon so it survives navigation.
 * Never throws — a tracking failure must not affect the page.
 */
export function trackEvent(payload: TrackPayload): void {
  try {
    if (typeof window === "undefined") return;
    const consent = loadConsent();
    if (!consent.decided || !consent.choices.analytics) return;
    const body = JSON.stringify(payload);
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    // ignore — analytics must never break navigation
  }
}
