"use client";

import { useRef } from "react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface ReviewTab {
  id: string;
  label: string;
  icon: string;
  /** Optional count/badge rendered after the label. */
  count?: number;
  /** Render the count with a danger tone (e.g. blocking warnings). */
  alert?: boolean;
}

interface ReviewTabsProps {
  tabs: ReviewTab[];
  active: string;
  onChange: (id: string) => void;
  /** Used to wire aria-controls to the panel. */
  panelIdPrefix: string;
}

/**
 * Accessible tab bar (WAI-ARIA tabs pattern). Arrow keys move focus and
 * selection; Home/End jump to ends. Manual activation is keyboard-operable.
 */
export function ReviewTabs({ tabs, active, onChange, panelIdPrefix }: ReviewTabsProps) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.findIndex((t) => t.id === active);
    if (index < 0) return;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    const id = tabs[next].id;
    onChange(id);
    refs.current[id]?.focus();
  };

  return (
    <div className="-mx-1 overflow-x-auto">
      <div role="tablist" aria-label="Import review sections" className="flex min-w-max gap-1 border-b border-border px-1">
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${panelIdPrefix}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${panelIdPrefix}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={onKeyDown}
              className={cn(
                "flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                selected
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon name={tab.icon} className="size-4" aria-hidden />
              {tab.label}
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    tab.alert
                      ? "bg-danger/10 text-danger"
                      : "bg-surface-muted text-text-tertiary",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
