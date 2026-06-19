"use client";

import { useEffect, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { packageSchema } from "@/domain/schemas";
import { PUBLISHING_STATUSES } from "@/domain/enums";
import { titleCase } from "@/lib/utils";
import { Field, Input, Textarea, Select, Checkbox, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface PackageDialogProps {
  open: boolean;
  mode: "create" | "edit";
  form: UseFormReturn<z.input<typeof packageSchema>, unknown, z.output<typeof packageSchema>>;
  onClose: () => void;
  onSubmit: () => void;
}

/** Accessible add/edit dialog for a package/plan, with a managed feature list (no prices). */
export function PackageDialog({ open, mode, form, onClose, onSubmit }: PackageDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const features = (watch("features") ?? []) as string[];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const updateFeature = (index: number, value: string) => {
    const next = [...features];
    next[index] = value;
    setValue("features", next, { shouldValidate: true, shouldDirty: true });
  };

  const addFeature = () => {
    setValue("features", [...features, ""], { shouldValidate: true, shouldDirty: true });
  };

  const removeFeature = (index: number) => {
    setValue(
      "features",
      features.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const featuresError =
    typeof errors.features?.message === "string" ? errors.features.message : undefined;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/60" aria-hidden onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-y-auto rounded-[20px] border border-border bg-canvas p-6 shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-heading text-h3 text-text-primary">
            {mode === "create" ? "New package" : "Edit package"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <Icon name="X" className="size-5" aria-hidden />
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="mt-5 flex flex-col gap-4"
        >
          <Field label="Name" htmlFor="pkg-name" error={errors.name?.message} required>
            <Input id="pkg-name" {...register("name")} />
          </Field>
          <Field
            label="Summary"
            htmlFor="pkg-summary"
            error={errors.summary?.message}
            hint="A short, plain-language description. No prices — quotes are managed separately."
            required
          >
            <Textarea id="pkg-summary" rows={2} {...register("summary")} />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pkg-feature-0" required>
                Features
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <Icon name="Plus" className="size-4" aria-hidden />
                Add feature
              </Button>
            </div>
            {features.length === 0 ? (
              <p className="text-xs text-text-secondary">
                No features yet. Add at least one feature for this package.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Input
                      id={`pkg-feature-${index}`}
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      aria-label={`Feature ${index + 1}`}
                      placeholder="e.g. Digital menu & product pages"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      aria-label={`Remove feature ${index + 1}`}
                    >
                      <Icon name="Trash2" className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {featuresError ? (
              <p role="alert" className="text-xs font-medium text-danger">
                {featuresError}
              </p>
            ) : null}
          </fieldset>

          <Field
            label="Badge"
            htmlFor="pkg-badge"
            error={errors.badge?.message}
            hint='Optional label shown on the public page (e.g. "Most popular").'
          >
            <Input id="pkg-badge" {...register("badge")} placeholder="Optional" />
          </Field>

          <label className="flex items-center gap-3 rounded-[12px] border border-border bg-surface p-3">
            <Checkbox id="pkg-highlighted" {...register("highlighted")} />
            <span className="text-small font-medium text-text-primary">
              Highlight as the recommended package
            </span>
          </label>

          <Field
            label="Status"
            htmlFor="pkg-status"
            error={errors.status?.message}
            hint="Publishing is explicit — moving to Published never happens automatically on save."
            required
          >
            <Select id="pkg-status" {...register("status")}>
              {PUBLISHING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Icon name="Save" className="size-4" aria-hidden />
              {mode === "create" ? "Create package" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
