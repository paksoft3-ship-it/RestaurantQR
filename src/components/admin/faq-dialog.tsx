"use client";

import { useEffect, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { faqSchema } from "@/domain/schemas";
import { PUBLISHING_STATUSES } from "@/domain/enums";
import { titleCase } from "@/lib/utils";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface FaqDialogProps {
  open: boolean;
  mode: "create" | "edit";
  form: UseFormReturn<z.input<typeof faqSchema>, unknown, z.output<typeof faqSchema>>;
  /** Existing categories offered as datalist suggestions. */
  categories: string[];
  onClose: () => void;
  onSubmit: () => void;
}

/** Accessible add/edit dialog for an FAQ entry. */
export function FaqDialog({ open, mode, form, categories, onClose, onSubmit }: FaqDialogProps) {
  const titleId = useId();
  const listId = useId();
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
            {mode === "create" ? "New question" : "Edit question"}
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
          <Field
            label="Category"
            htmlFor="faq-category"
            error={errors.category?.message}
            hint="Group related questions (e.g. general, managed, qr-nfc)."
            required
          >
            <Input id="faq-category" list={listId} {...register("category")} />
            <datalist id={listId}>
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Question" htmlFor="faq-question" error={errors.question?.message} required>
            <Input id="faq-question" {...register("question")} />
          </Field>
          <Field label="Answer" htmlFor="faq-answer" error={errors.answer?.message} required>
            <Textarea id="faq-answer" rows={5} {...register("answer")} />
          </Field>
          <Field
            label="Status"
            htmlFor="faq-status"
            error={errors.status?.message}
            hint="Publishing is explicit — moving to Published never happens automatically on save."
            required
          >
            <Select id="faq-status" {...register("status")}>
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
              {mode === "create" ? "Create question" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
