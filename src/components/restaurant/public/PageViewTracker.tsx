"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/track";

/**
 * Records a page/menu/product view for the restaurant on each public route.
 * Mounted once in the restaurant layout. The visitor's arrival channel is read
 * from a `?via=qr|nfc` query param (set on QR/NFC artwork links), else "direct".
 */
export function PageViewTracker({ restaurantId, slug }: { restaurantId: string; slug: string }) {
  const pathname = usePathname();
  const lastRef = useRef<string>("");

  useEffect(() => {
    if (!pathname || lastRef.current === pathname) return;
    lastRef.current = pathname;

    const base = `/restaurants/${slug}`;
    let type: "page_view" | "menu_view" | "product_view" = "page_view";
    let target: string | undefined;
    if (pathname === `${base}/menu`) {
      type = "menu_view";
    } else if (pathname.startsWith(`${base}/menu/`)) {
      type = "product_view";
      target = pathname.split("/").filter(Boolean).pop();
    }

    const via = new URLSearchParams(window.location.search).get("via");
    const channel = via === "qr" || via === "nfc" ? via : "direct";
    trackEvent({ restaurantId, type, channel, target });
  }, [pathname, restaurantId, slug]);

  return null;
}
