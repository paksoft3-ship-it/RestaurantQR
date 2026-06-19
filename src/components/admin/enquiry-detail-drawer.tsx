"use client";

import { useEffect, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { enquiryUpdateSchema } from "@/domain/schemas";
import { ENQUIRY_STATUSES } from "@/domain/enums";
import { formatDate, titleCase } from "@/lib/utils";
import type { Enquiry } from "@/domain/entities";
import { Field, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";

interface EnquiryDetailDrawerProps {
  enquiry: Enquiry | null;
  form: UseFormReturn<z.input<typeof enquiryUpdateSchema>, unknown, z.output<typeof enquiryUpdateSchema>>;
  teamOptions: string[];
  onClose: () => void;
  onSubmit: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{label}</dt>
      <dd className="text-small text-text-primary">{value || "—"}</dd>
    </div>
  );
}

/** Slide-over detail panel for a single enquiry with an inline status/owner update form. */
export function EnquiryDetailDrawer({
  enquiry,
  form,
  teamOptions,
  onClose,
  onSubmit,
}: EnquiryDetailDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const open = enquiry !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!enquiry) return null;

  const {
    register,
    formState: { errors, isDirty },
  } = form;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div className="absolute inset-0 bg-navy-deep/60" aria-hidden onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-canvas shadow-lift focus-visible:outline-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              Enquiry
            </p>
            <h2 id={titleId} className="font-heading text-h3 text-text-primary">
              {enquiry.restaurantName}
            </h2>
            <div className="mt-2">
              <StatusBadge group="enquiry" value={enquiry.status} />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close enquiry detail">
            <Icon name="X" className="size-5" aria-hidden />
          </Button>
        </header>

        <div className="flex-1 p-5">
          <dl className="flex flex-col">
            <Row label="Contact person" value={enquiry.contactPerson} />
            <Row
              label="Email"
              value={
                <a href={`mailto:${enquiry.email}`} className="text-primary hover:underline">
                  {enquiry.email}
                </a>
              }
            />
            <Row label="Phone" value={enquiry.phone} />
            <Row label="Preferred contact" value={titleCase(enquiry.preferredContactMethod)} />
            <Row
              label="Location"
              value={[enquiry.city, enquiry.country].filter(Boolean).join(", ")}
            />
            <Row
              label="Restaurant type"
              value={enquiry.restaurantType ? titleCase(enquiry.restaurantType) : "—"}
            />
            <Row label="Enquiry type" value={titleCase(enquiry.enquiryType)} />
            <Row label="Package interest" value={enquiry.packageInterest} />
            <Row
              label="Feature interest"
              value={enquiry.featureInterest.length ? enquiry.featureInterest.join(", ") : "—"}
            />
            <Row
              label="Product interest"
              value={enquiry.productInterest.length ? enquiry.productInterest.join(", ") : "—"}
            />
            <Row label="Message" value={enquiry.message} />
            <Row label="Received" value={formatDate(enquiry.createdAt)} />
          </dl>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="mt-6 flex flex-col gap-4 rounded-[16px] border border-border bg-surface p-4"
          >
            <p className="text-small font-semibold text-text-primary">Update lead</p>
            <Field label="Status" htmlFor="enq-status" error={errors.status?.message}>
              <Select id="enq-status" {...register("status")}>
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assigned team" htmlFor="enq-team" error={errors.assignedTeam?.message}>
              <Select id="enq-team" {...register("assignedTeam")}>
                <option value="">Unassigned</option>
                {teamOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="text-xs text-text-secondary">
              Status changes are recorded in activity history. No email or call is sent — these are
              demo leads.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty}>
                <Icon name="Save" className="size-4" aria-hidden />
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
