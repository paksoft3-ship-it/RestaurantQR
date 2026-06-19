"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

/**
 * Desktop sticky table of contents with active-section tracking via
 * IntersectionObserver. Marked `no-print` (hidden when printing).
 */
export function StickyLegalTOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="On this page" className="no-print flex flex-col gap-1 border-l-2 border-border">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active ? "true" : undefined}
            className={cn(
              "-ml-0.5 border-l-2 py-1.5 pl-4 text-small transition-colors",
              active
                ? "border-primary font-semibold text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
