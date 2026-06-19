"use client";

import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/shared/icon";
import { EmptyState } from "@/components/shared/states";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  label: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  categories: FaqCategory[];
  className?: string;
}

const ALL = "all";

/**
 * Accessible, searchable FAQ accordion. Uses native <details>/<summary> so it
 * is keyboard operable and works without JavaScript-driven hover.
 */
export function FaqAccordion({ items, categories, className }: FaqAccordionProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const searchId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === ALL || item.category === activeCategory;
      const matchesQuery =
        q.length === 0 ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, activeCategory]);

  const tabs: FaqCategory[] = [{ id: ALL, label: "All Questions" }, ...categories];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search frequently asked questions
        </label>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
          <Icon name="Search" className="size-5" aria-hidden />
        </span>
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for answers..."
          className="h-12 w-full rounded-[12px] border border-input-border bg-canvas pl-11 pr-4 text-body text-text-primary outline-none placeholder:text-text-tertiary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter questions by category">
        {tabs.map((tab) => {
          const active = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-small font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-canvas text-text-secondary hover:border-primary hover:text-primary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="SearchX"
          title="No matching questions"
          description="Try a different search term or category, or contact our team directly."
        />
      ) : (
        <div className="flex flex-col gap-3" role="list">
          {filtered.map((item) => (
            <details
              key={item.id}
              role="listitem"
              className="group rounded-[16px] border border-border bg-canvas shadow-card open:border-primary/40"
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 p-5 font-heading text-h3 font-bold text-text-primary [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <Icon
                  name="ChevronDown"
                  className="size-5 shrink-0 text-text-secondary transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="px-5 pb-5 text-body text-text-secondary">{item.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
