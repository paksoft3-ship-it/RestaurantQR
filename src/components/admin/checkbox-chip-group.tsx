"use client";

import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { Option } from "@/components/admin/restaurant-form-options";

interface CheckboxChipGroupProps<T extends string> {
  legend: string;
  options: Option<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  error?: string;
  required?: boolean;
}

/** Accessible multi-select rendered as toggleable chips backed by checkboxes. */
export function CheckboxChipGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  error,
  required,
}: CheckboxChipGroupProps<T>) {
  const toggle = (v: T) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <fieldset>
      <legend className="text-small font-semibold text-text-primary">
        {legend}
        {required ? <span className="ml-0.5 text-danger">*</span> : null}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-small font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input-border bg-canvas text-text-secondary hover:bg-surface",
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => toggle(opt.value)}
              />
              {active ? <Icon name="Check" className="size-4" aria-hidden /> : null}
              {opt.label}
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
