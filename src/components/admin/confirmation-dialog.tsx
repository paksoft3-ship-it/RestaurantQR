"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone of the confirm button. */
  intent?: "primary" | "danger";
  icon?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Accessible confirmation dialog. role=dialog + aria-modal, Escape closes,
 * focus moves into the dialog, focus is trapped, and the trigger is restored.
 */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  intent = "primary",
  icon = "AlertTriangle",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-deep/60"
        aria-hidden
        onClick={() => !busy && onCancel()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative w-full max-w-md rounded-[20px] border border-border bg-canvas p-6 shadow-lift"
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              intent === "danger" ? "bg-danger/10 text-danger" : "bg-surface-warm text-primary",
            )}
          >
            <Icon name={icon} className="size-5" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 id={titleId} className="font-heading text-h3 text-text-primary">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-small text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={intent === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Icon name="Loader2" className="size-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
