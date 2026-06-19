"use client";

import { Icon } from "@/components/shared/icon";
import { Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface AdminFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Search + select-filter bar used above admin tables. */
export function AdminFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  onReset,
  hasActiveFilters,
  className,
  children,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-4 shadow-card",
        className,
      )}
    >
      <div className="relative">
        <Icon
          name="Search"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
          className="h-11 w-full rounded-[12px] border border-input-border bg-canvas pl-9 pr-3 text-body text-text-primary placeholder:text-text-tertiary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        />
      </div>

      {filters.length > 0 || children ? (
        <div className="flex flex-wrap items-end gap-3">
          {filters.map((filter) => (
            <div key={filter.id} className="flex min-w-[160px] flex-col gap-1.5">
              <Label htmlFor={`filter-${filter.id}`}>{filter.label}</Label>
              <Select
                id={`filter-${filter.id}`}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
          {children}
          {onReset && hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={onReset} className="mb-0.5">
              <Icon name="X" className="size-4" aria-hidden />
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
