"use client";

import { useEffect, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { teamUserSchema } from "@/domain/schemas";
import { ROLES, ROLE_LABELS, permissionsForRole } from "@/domain/permissions";
import { titleCase } from "@/lib/utils";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

const STATUS_OPTIONS = ["active", "inactive", "locked"] as const;

interface TeamUserDialogProps {
  open: boolean;
  mode: "create" | "edit";
  form: UseFormReturn<z.input<typeof teamUserSchema>, unknown, z.output<typeof teamUserSchema>>;
  onClose: () => void;
  onSubmit: () => void;
}

/** Accessible add/edit dialog for an admin team member, with a live permission summary. */
export function TeamUserDialog({ open, mode, form, onClose, onSubmit }: TeamUserDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const role = watch("role");
  const permissions = role ? permissionsForRole(role) : [];

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
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-[20px] border border-border bg-canvas p-6 shadow-lift"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-heading text-h3 text-text-primary">
            {mode === "create" ? "Invite team member" : "Edit team member"}
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
          <Field label="Display name" htmlFor="tu-name" error={errors.displayName?.message} required>
            <Input id="tu-name" {...register("displayName")} />
          </Field>
          <Field label="Email" htmlFor="tu-email" error={errors.email?.message} required>
            <Input id="tu-email" type="email" {...register("email")} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Role" htmlFor="tu-role" error={errors.role?.message} required>
              <Select id="tu-role" {...register("role")}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" htmlFor="tu-status" error={errors.status?.message} required>
              <Select id="tu-status" {...register("status")}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="rounded-[12px] border border-border bg-surface p-4">
            <p className="text-small font-semibold text-text-primary">
              Permissions for this role
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Default grants for {role ? ROLE_LABELS[role] : "the selected role"}. Server-side
              enforcement is the source of truth.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {permissions.length === 0 ? (
                <span className="text-xs text-text-tertiary">No permissions.</span>
              ) : (
                permissions.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-surface-warm px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {p}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Icon name="Save" className="size-4" aria-hidden />
              {mode === "create" ? "Add member" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
