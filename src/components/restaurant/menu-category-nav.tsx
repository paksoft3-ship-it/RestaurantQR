"use client";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface MenuCategoryNavItem {
  id: string;
  name: string;
}

interface MenuCategoryNavProps {
  categories: MenuCategoryNavItem[];
  /** Current search query (controlled). */
  search: string;
  onSearchChange: (value: string) => void;
  /** Currently active category id, or "all" for everything. */
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Search input + horizontally scrollable category chips for the digital menu.
 * Selecting a chip filters the product list (handled by the parent). The whole
 * control is sticky beneath the header so it stays reachable while scrolling.
 */
export function MenuCategoryNav({
  categories,
  search,
  onSearchChange,
  activeId,
  onSelect,
}: MenuCategoryNavProps) {
  const chips: MenuCategoryNavItem[] = [{ id: "all", name: "All" }, ...categories];

  return (
    <div className="sticky top-14 z-30 -mx-5 border-b border-border bg-canvas/95 px-5 pb-3 pt-3 backdrop-blur md:-mx-8 md:px-8">
      <div className="relative">
        <Icon
          name="Search"
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-tertiary"
          aria-hidden
        />
        <input
          type="search"
          inputMode="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search the menu"
          aria-label="Search the menu"
          className="h-11 w-full rounded-[12px] border border-input-border bg-canvas pl-10 pr-4 text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        />
      </div>

      <div
        className="mt-3 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Menu categories"
      >
        {chips.map((chip) => {
          const isActive = chip.id === activeId;
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(chip.id)}
              className={cn(
                "min-h-[40px] shrink-0 rounded-full border px-4 text-button font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isActive
                  ? "border-transparent bg-primary text-white"
                  : "border-border bg-canvas text-text-secondary hover:bg-surface",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
