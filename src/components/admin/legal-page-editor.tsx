"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { legalPageMetaSchema } from "@/domain/schemas";
import { PUBLISHING_STATUSES } from "@/domain/enums";
import { createId, formatDate, titleCase } from "@/lib/utils";
import type { LegalPage, LegalSection } from "@/domain/entities";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface LegalPageEditorProps {
  page: LegalPage;
  /** Whether the current user may edit. Read-only mode disables inputs and save. */
  canEdit: boolean;
  onBack: () => void;
  onSave: (input: {
    version: string;
    effectiveDate: string;
    status: LegalPage["status"];
    sections: LegalSection[];
  }) => void;
}

/** Editor for a single legal page: metadata form + inline section editing. */
export function LegalPageEditor({ page, canEdit, onBack, onSave }: LegalPageEditorProps) {
  const [sections, setSections] = useState<LegalSection[]>(page.sections);

  const form = useForm<
    z.input<typeof legalPageMetaSchema>,
    unknown,
    z.output<typeof legalPageMetaSchema>
  >({
    resolver: zodResolver(legalPageMetaSchema),
    defaultValues: {
      version: page.version,
      effectiveDate: page.effectiveDate ?? "",
      status: page.status,
    },
  });

  useEffect(() => {
    setSections(page.sections);
    form.reset({
      version: page.version,
      effectiveDate: page.effectiveDate ?? "",
      status: page.status,
    });
    // Reset whenever a different page is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const {
    register,
    formState: { errors },
  } = form;

  const updateSection = (id: string, patch: Partial<LegalSection>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSection = () => {
    setSections((prev) => [...prev, { id: createId("sec"), title: "New section", body: "" }]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    setSections((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  const onSubmit = form.handleSubmit((input) => {
    onSave({
      version: input.version,
      effectiveDate: input.effectiveDate ?? "",
      status: input.status,
      sections,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <Icon name="ArrowLeft" className="size-4" aria-hidden />
          Back to all legal pages
        </Button>
        <StatusBadge group="publishing" value={page.status} />
      </div>

      <AdminSection title="Page metadata" icon="FileText" description={`${titleCase(page.type)} · ${page.locale.toUpperCase()}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Version" htmlFor="legal-version" error={errors.version?.message} required>
            <Input id="legal-version" disabled={!canEdit} {...register("version")} />
          </Field>
          <Field
            label="Effective date"
            htmlFor="legal-effective"
            error={errors.effectiveDate?.message}
            hint="ISO date (YYYY-MM-DD) or leave blank."
          >
            <Input id="legal-effective" type="date" disabled={!canEdit} {...register("effectiveDate")} />
          </Field>
          <Field
            label="Status"
            htmlFor="legal-status"
            error={errors.status?.message}
            hint="Publishing is explicit — never automatic."
            required
          >
            <Select id="legal-status" disabled={!canEdit} {...register("status")}>
              {PUBLISHING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-text-tertiary">
          Last updated {formatDate(page.lastUpdated)}
        </p>
      </AdminSection>

      <AdminSection
        title="Sections"
        icon="ListOrdered"
        description="Edit each section's heading and body. Bodies are stored and rendered as plain text."
        actions={
          canEdit ? (
            <Button type="button" variant="outline" size="sm" onClick={addSection}>
              <Icon name="Plus" className="size-4" aria-hidden />
              Add section
            </Button>
          ) : undefined
        }
      >
        {sections.length === 0 ? (
          <p className="text-small text-text-secondary">This page has no sections yet.</p>
        ) : (
          <ul className="flex flex-col gap-5">
            {sections.map((section, index) => (
              <li
                key={section.id}
                className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-4"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Field
                      label={`Section ${index + 1} title`}
                      htmlFor={`sec-title-${section.id}`}
                    >
                      <Input
                        id={`sec-title-${section.id}`}
                        value={section.title}
                        disabled={!canEdit}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      />
                    </Field>
                  </div>
                  {canEdit ? (
                    <div className="flex shrink-0 items-center gap-1 pt-7">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(section.id, "up")}
                        disabled={index === 0}
                        aria-label={`Move section ${index + 1} up`}
                      >
                        <Icon name="ArrowUp" className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveSection(section.id, "down")}
                        disabled={index === sections.length - 1}
                        aria-label={`Move section ${index + 1} down`}
                      >
                        <Icon name="ArrowDown" className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSection(section.id)}
                        aria-label={`Remove section ${index + 1}`}
                      >
                        <Icon name="Trash2" className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <Field label="Body" htmlFor={`sec-body-${section.id}`}>
                  <Textarea
                    id={`sec-body-${section.id}`}
                    rows={6}
                    value={section.body}
                    disabled={!canEdit}
                    onChange={(e) => updateSection(section.id, { body: e.target.value })}
                  />
                </Field>
                <div className="rounded-[10px] border border-border bg-canvas p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Preview (plain text)
                  </p>
                  {section.body.trim() === "" ? (
                    <p className="text-small text-text-tertiary">No content yet.</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {section.body.split("\n").map((line, i) =>
                        line.trim() === "" ? (
                          <span key={i} aria-hidden className="h-1.5" />
                        ) : (
                          <p key={i} className="text-small text-text-secondary">
                            {line}
                          </p>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      {canEdit ? (
        <StickyActionBar
          info="Changes save to the database and appear on the public legal page once set to Published."
        >
          <Button type="button" variant="ghost" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit">
            <Icon name="Save" className="size-4" aria-hidden />
            Save changes
          </Button>
        </StickyActionBar>
      ) : (
        <div className="rounded-[12px] border border-border bg-surface p-4 text-small text-text-secondary">
          You have read-only access to legal pages.
        </div>
      )}
    </form>
  );
}
