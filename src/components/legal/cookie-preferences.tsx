"use client";

import { useEffect, useId, useReducer, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  CATEGORY_META,
  COOKIE_CATEGORIES,
  consentReducer,
  initialConsent,
  loadConsent,
  saveConsent,
  type CookieCategory,
} from "@/lib/cookies/consent";

const CATEGORY_ICON: Record<CookieCategory, string> = {
  essential: "ShieldCheck",
  preferences: "SlidersHorizontal",
  analytics: "BarChart3",
  marketing: "Megaphone",
};

/**
 * Full cookie preferences panel. Reuses the framework-free consent reducer/store
 * from `@/lib/cookies/consent`. No dark patterns: optional categories default OFF,
 * and reject/accept/save buttons share comparable prominence.
 */
export function CookiePreferences({ className }: { className?: string }) {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(consentReducer, initialConsent());
  const [ready, setReady] = useState(false);
  const groupId = useId();

  // Hydrate from storage on the client only (server render shows defaults).
  useEffect(() => {
    const stored = loadConsent();
    if (stored.decided) {
      dispatch({ type: "save", choices: stored.choices });
    }
    setReady(true);
  }, []);

  const persist = (next: typeof state, message: string) => {
    saveConsent(next);
    toast({ title: "Preferences saved", description: message, intent: "success" });
  };

  const handleAcceptAll = () => {
    const next = consentReducer(state, { type: "accept-all" });
    dispatch({ type: "accept-all" });
    persist(next, "All optional cookies are now enabled.");
  };

  const handleRejectOptional = () => {
    const next = consentReducer(state, { type: "reject-optional" });
    dispatch({ type: "reject-optional" });
    persist(next, "Only essential cookies remain active.");
  };

  const handleSave = () => {
    const next = consentReducer(state, { type: "save", choices: state.choices });
    dispatch({ type: "save", choices: state.choices });
    persist(next, "Your selected preferences have been stored.");
  };

  const handleReset = () => {
    dispatch({ type: "reset" });
    saveConsent(initialConsent());
    toast({
      title: "Choice reset",
      description: "Your saved cookie choice was cleared. The notice will appear again.",
      intent: "info",
    });
  };

  return (
    <Card
      id="manage-preferences"
      className={cn("scroll-mt-28 overflow-hidden border-2", className)}
    >
      <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-4 md:px-6">
        <span className="flex size-9 items-center justify-center rounded-full bg-surface-warm text-primary">
          <Icon name="Cookie" className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading text-h3 text-text-primary">Manage your cookie preferences</h2>
          <p className="text-small text-text-secondary">
            Optional cookies stay off until you turn them on. Change your mind any time.
          </p>
        </div>
      </div>

      <div className="space-y-4 p-5 md:p-6">
        <p
          className="rounded-[12px] border border-info/20 bg-info/5 p-3 text-small text-text-secondary"
          role="note"
        >
          <Icon name="Info" className="mr-1.5 inline size-4 align-text-bottom text-info" aria-hidden />
          No real analytics or marketing tools are active in this build. Enabling a category only
          records your preference for when such tools are configured.
        </p>

        <fieldset className="space-y-3" aria-describedby={`${groupId}-legend`}>
          <legend id={`${groupId}-legend`} className="sr-only">
            Cookie categories
          </legend>

          {COOKIE_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const checked = state.choices[category];
            const locked = Boolean(meta.locked);
            const controlId = `${groupId}-${category}`;

            return (
              <div
                key={category}
                className="flex items-start justify-between gap-4 rounded-[12px] border border-border bg-canvas p-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                      locked ? "bg-success/10 text-success" : "bg-surface-container text-text-secondary",
                    )}
                  >
                    <Icon name={CATEGORY_ICON[category]} className="size-4" aria-hidden />
                  </span>
                  <div>
                    <label
                      htmlFor={controlId}
                      className="block text-small font-semibold text-text-primary"
                    >
                      {meta.label}
                      {locked ? (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                          <Icon name="Lock" className="size-3" aria-hidden /> Always active
                        </span>
                      ) : null}
                    </label>
                    <p id={`${controlId}-desc`} className="mt-1 text-small text-text-secondary">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <label
                  className={cn(
                    "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center",
                    locked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                >
                  <input
                    id={controlId}
                    type="checkbox"
                    role="switch"
                    className="peer sr-only"
                    checked={checked}
                    disabled={locked}
                    aria-checked={checked}
                    aria-describedby={`${controlId}-desc`}
                    onChange={() => dispatch({ type: "toggle", category })}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "h-6 w-11 rounded-full transition-colors",
                      "after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-['']",
                      "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                      checked ? "bg-primary after:translate-x-5" : "bg-surface-dim",
                      locked && "opacity-70",
                    )}
                  />
                </label>
              </div>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleRejectOptional}
          >
            Reject optional
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleAcceptAll}
          >
            Accept all optional
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={handleSave}>
            Save preferences
          </Button>
        </div>

        <div className="flex flex-col items-start justify-between gap-2 border-t border-border pt-4 text-small text-text-secondary sm:flex-row sm:items-center">
          <p aria-live="polite">
            {ready && state.decided && state.updatedAt
              ? `Last updated ${formatDate(state.updatedAt)}.`
              : "No saved choice yet — only essential cookies are active."}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <Icon name="RotateCcw" className="size-4" aria-hidden />
            Reset choice
          </Button>
        </div>
      </div>
    </Card>
  );
}
