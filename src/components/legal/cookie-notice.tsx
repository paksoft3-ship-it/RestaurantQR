"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import {
  consentReducer,
  initialConsent,
  loadConsent,
  saveConsent,
  type ConsentState,
} from "@/lib/cookies/consent";

/** Minimal, non-dark-pattern cookie notice shown until a choice is made. */
export function CookieNotice() {
  const [state, setState] = useState<ConsentState>(initialConsent());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadConsent());
    setReady(true);
  }, []);

  if (!ready || state.decided) return null;

  const decide = (action: "accept-all" | "reject-optional") => {
    const next = consentReducer(state, { type: action });
    saveConsent(next);
    setState(next);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-border bg-canvas p-4 shadow-lift"
    >
      <div className="mx-auto flex max-w-page flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
        <p className="text-small text-text-secondary">
          We use essential cookies to run this site, and optional cookies only with your consent.{" "}
          <Link href={routes.marketing.cookies()} className="font-semibold text-primary underline">
            Manage preferences
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          {/* Reject and Accept have comparable prominence (no dark pattern). */}
          <Button variant="secondary" size="sm" onClick={() => decide("reject-optional")}>
            Reject optional
          </Button>
          <Button size="sm" onClick={() => decide("accept-all")}>
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
