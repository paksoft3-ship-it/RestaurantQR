"use client";

import { useState } from "react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

/**
 * Share the restaurant's public page. Uses the native share sheet where
 * available (mobile — send to WhatsApp, Messages, etc.), otherwise copies the
 * link to the clipboard with "Link copied!" feedback.
 */
export function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/restaurants/${slug}`
        : `/restaurants/${slug}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch (err) {
        // User cancelled the share sheet — do nothing.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Otherwise fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — last-resort prompt so the user can copy manually.
      if (typeof window !== "undefined") window.prompt("Copy this link:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-small font-semibold transition-colors",
        copied
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-canvas text-text-secondary hover:border-primary/50 hover:text-primary",
      )}
    >
      <Icon name={copied ? "Check" : "Share2"} className="size-4" aria-hidden />
      {copied ? "Link copied!" : "Share this page"}
    </button>
  );
}
