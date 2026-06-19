"use client";

import { useEffect, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { websiteContentSchema } from "@/domain/schemas";
import { PUBLISHING_STATUSES } from "@/domain/enums";
import { titleCase } from "@/lib/utils";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface WebsiteBlockDialogProps {
  open: boolean;
  mode: "create" | "edit";
  form: UseFormReturn<
    z.input<typeof websiteContentSchema>,
    unknown,
    z.output<typeof websiteContentSchema>
  >;
  onClose: () => void;
  onSubmit: () => void;
}

/** Add/edit dialog for a marketing-website content block, with explicit status workflow. */
export function WebsiteBlockDialog({ open, mode, form, onClose, onSubmit }: WebsiteBlockDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    formState: { errors },
  } = form;

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
            {mode === "create" ? "New content block" : "Edit content block"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Page" htmlFor="wc-page" error={errors.page?.message} required>
              <Input id="wc-page" placeholder="e.g. home" {...register("page")} />
            </Field>
            <Field label="Section" htmlFor="wc-section" error={errors.section?.message} required>
              <Input id="wc-section" placeholder="e.g. hero" {...register("section")} />
            </Field>
          </div>
          <Field label="Title" htmlFor="wc-title" error={errors.title?.message} required>
            <Input id="wc-title" {...register("title")} />
          </Field>
          <Field label="Body" htmlFor="wc-body" error={errors.body?.message} required>
            <Textarea id="wc-body" rows={4} {...register("body")} />
          </Field>
          <Field
            label="Status"
            htmlFor="wc-status"
            error={errors.status?.message}
            hint="Publishing is explicit — moving to Published never happens automatically on save."
            required
          >
            <Select id="wc-status" {...register("status")}>
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
              {mode === "create" ? "Create block" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
