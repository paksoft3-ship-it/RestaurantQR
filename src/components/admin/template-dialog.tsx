"use client";

import { useEffect, useId, useRef, type ChangeEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { templateSchema } from "@/domain/schemas";
import { VISUAL_DIRECTIONS, PUBLISHING_STATUSES } from "@/domain/enums";
import { titleCase } from "@/lib/utils";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface TemplateDialogProps {
  open: boolean;
  mode: "create" | "edit";
  form: UseFormReturn<z.input<typeof templateSchema>, unknown, z.output<typeof templateSchema>>;
  imageUrl: string | null;
  uploading: boolean;
  onPickImage: (file: File) => void;
  onRemoveImage: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

/** Accessible add/edit dialog for a visual-direction template. */
export function TemplateDialog({
  open,
  mode,
  form,
  imageUrl,
  uploading,
  onPickImage,
  onRemoveImage,
  onClose,
  onSubmit,
}: TemplateDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onPickImage(file);
  };

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
            {mode === "create" ? "New template" : "Edit template"}
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
          <Field label="Name" htmlFor="tpl-name" error={errors.name?.message} required>
            <Input id="tpl-name" {...register("name")} />
          </Field>
          <Field
            label="Visual direction"
            htmlFor="tpl-direction"
            error={errors.direction?.message}
            required
          >
            <Select id="tpl-direction" {...register("direction")}>
              {VISUAL_DIRECTIONS.map((d) => (
                <option key={d} value={d}>
                  {titleCase(d)}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Description"
            htmlFor="tpl-description"
            error={errors.description?.message}
            required
          >
            <Textarea id="tpl-description" rows={3} {...register("description")} />
          </Field>
          <Field
            label="Best for"
            htmlFor="tpl-bestFor"
            error={errors.bestFor?.message}
            hint="Who this visual direction suits best (e.g. pizzerias, grills)."
            required
          >
            <Input id="tpl-bestFor" {...register("bestFor")} />
          </Field>
          <Field label="Preview image" htmlFor="tpl-image">
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-border bg-surface">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Template preview" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="Image" className="size-5 text-text-tertiary" aria-hidden />
                )}
              </span>
              <input
                ref={fileRef}
                id="tpl-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFile}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Icon name="Upload" className="size-4" aria-hidden />
                {uploading ? "Uploading…" : imageUrl ? "Replace" : "Upload"}
              </Button>
              {imageUrl ? (
                <Button type="button" variant="ghost" size="sm" onClick={onRemoveImage}>
                  Remove
                </Button>
              ) : null}
            </div>
          </Field>
          <Field
            label="Status"
            htmlFor="tpl-status"
            error={errors.status?.message}
            hint="Publishing is explicit — moving to Published never happens automatically on save."
            required
          >
            <Select id="tpl-status" {...register("status")}>
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
              {mode === "create" ? "Create template" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
