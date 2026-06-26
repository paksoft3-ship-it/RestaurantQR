"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { appConfig } from "@/lib/config/app-config";
import { formatDate, titleCase } from "@/lib/utils";
import type { Restaurant } from "@/domain/entities";
import type { MenuImport, ImportConfig, ImportResult, ImportErrorCode } from "@/domain/menu-import";
import {
  importConfigSchema,
  EXTRACTION_MODES,
  EXISTING_MENU_BEHAVIORS,
  IMAGE_HANDLING_MODES,
  IMPORT_CURRENCY_OPTIONS,
  IMPORT_LANGUAGE_OPTIONS,
} from "@/domain/menu-import";
import { PERMISSIONS } from "@/domain/permissions";
import { menuImportService } from "@/features/menu-import/service";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";
import { EmptyState } from "@/components/shared/states";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useToast } from "@/components/ui/toast";
import { ProcessingStatusBadge, ReviewStatusBadge } from "@/components/menu-import/import-chips";

type ConfigFormInput = z.input<typeof importConfigSchema>;

interface ValidatedFile {
  file: File;
  pageCount: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/** Derive a plausible page count from file size (demo only). */
function estimatePageCount(size: number, maxPages: number): number {
  const estimate = Math.max(1, Math.round(size / (120 * 1024)));
  return Math.min(maxPages, estimate);
}

const LANGUAGE_LABELS: Record<string, string> = {
  auto: "Auto-detect",
  tr: "Turkish",
  en: "English",
  ar: "Arabic",
  de: "German",
};

export default function MenuImportLandingPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const router = useRouter();
  const user = useAdminUser();
  const { toast } = useToast();

  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ready, setReady] = useState(false);
  const [imports, setImports] = useState<MenuImport[]>([]);
  const [validated, setValidated] = useState<ValidatedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<MenuImport | null>(null);

  const maxSizeMb = appConfig.menuImport.maxFileSizeMb;
  const maxPages = appConfig.menuImport.maxPageCount;

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setImports(menuImportService.listByRestaurant(id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  const { register, handleSubmit } = useForm<ConfigFormInput, unknown, ImportConfig>({
    resolver: zodResolver(importConfigSchema),
    defaultValues: {
      defaultLanguage: "auto",
      currency: "auto",
      existingMenuBehavior: "new-draft",
      imageHandling: "manual-review",
      extractionMode: "maximum-accuracy",
    },
  });

  const validateFile = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.type !== "application/pdf") {
        setValidated(null);
        setFileError("Only PDF files are supported (application/pdf).");
        return;
      }
      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > maxSizeMb) {
        setValidated(null);
        setFileError(`File is ${sizeMb.toFixed(1)} MB — the limit is ${maxSizeMb} MB.`);
        return;
      }
      setValidated({ file, pageCount: estimatePageCount(file.size, maxPages) });
    },
    [maxSizeMb, maxPages],
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateFile(file);
  };

  const onSubmit = async (config: ImportConfig) => {
    if (!validated) {
      setFileError("Choose a PDF file before starting the import.");
      return;
    }
    setSubmitting(true);

    const created = menuImportService.create({
      restaurantId: id,
      fileName: validated.file.name,
      fileSize: validated.file.size,
      pageCount: validated.pageCount,
      pdfType: "scanned",
      config,
      createdBy: user?.id ?? null,
      idempotencyKey: `${validated.file.name}-${validated.file.size}-${Date.now()}`,
    });
    const detailHref = routes.admin.restaurantMenuImportDetail(id, created.id);

    try {
      const body = new FormData();
      body.append("file", validated.file);
      body.append("importId", created.id);
      body.append("restaurantId", id);
      body.append("config", JSON.stringify(config));

      const res = await fetch("/api/menu-import/extract", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        result?: ImportResult;
        error?: string;
        errorCode?: ImportErrorCode;
      };

      if (!res.ok || !data.result) {
        const message = data.error ?? "OCR extraction failed.";
        menuImportService.markFailed(created.id, data.errorCode ?? "OCR_FAILED", message);
        toast({ title: "Extraction failed", description: message, intent: "danger" });
        router.push(detailHref);
        return;
      }

      menuImportService.ingestResult(created.id, data.result, user?.id ?? null);
      router.push(detailHref);
    } catch {
      menuImportService.markFailed(
        created.id,
        "OCR_FAILED",
        "Could not reach the extraction service.",
      );
      toast({ title: "Could not start import", intent: "danger" });
      router.push(detailHref);
    } finally {
      setSubmitting(false);
    }
  };

  const onArchive = () => {
    if (!archiveTarget) return;
    menuImportService.archive(archiveTarget.id);
    toast({ title: "Import archived", intent: "success" });
    setArchiveTarget(null);
  };

  const visibleImports = useMemo(
    () => imports.filter((imp) => imp.processingStatus !== "ARCHIVED"),
    [imports],
  );

  if (!appConfig.features.menuPdfImport) {
    return (
      <EmptyState
        title="PDF menu import is disabled"
        description="This feature is turned off for this environment. Enable it in configuration to import menus from PDF files."
        icon="FileX"
      >
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurantMenu(id)}>Back to menu</Link>
        </Button>
      </EmptyState>
    );
  }

  if (ready && !restaurant) {
    return (
      <EmptyState title="Restaurant not found" description="This restaurant may have been removed." icon="Store">
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurants()}>Back to restaurants</Link>
        </Button>
      </EmptyState>
    );
  }

  if (!restaurant) {
    return (
      <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader
        restaurant={restaurant}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(id) },
          { label: "Menu", href: routes.admin.restaurantMenu(id) },
          { label: "Import" },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.restaurantMenu(id)}>
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              Back to menu
            </Link>
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
        <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Menus are read with on-device OCR (Tesseract). Scanned/photographed menus are noisy —
          expect to correct item names. Every import requires human review before anything is
          saved, and nothing is published automatically.
        </span>
      </div>

      <PermissionGate
        user={user}
        permission={PERMISSIONS.MENU_IMPORT_CREATE}
        fallback={
          <EmptyState
            title="You can view imports but not create them"
            description="Your role does not include permission to start a new PDF import."
            icon="Lock"
          />
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <AdminSection title="Upload a menu PDF" description="Drag a file here or browse." icon="FileUp">
            <div className="flex flex-col gap-4">
              <label htmlFor={fileInputId} className="text-small font-semibold text-text-primary">
                Menu PDF file
              </label>
              <div
                role="button"
                tabIndex={0}
                aria-describedby={`${fileInputId}-hint`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  dragging ? "border-primary bg-surface-warm" : "border-input-border bg-surface"
                }`}
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-warm text-primary">
                  <Icon name="Upload" className="size-6" aria-hidden />
                </span>
                <p className="text-small font-semibold text-text-primary">
                  Drop your PDF here, or click to browse
                </p>
                <p id={`${fileInputId}-hint`} className="text-xs text-text-secondary">
                  PDF only · up to {maxSizeMb} MB · up to {maxPages} pages
                </p>
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={onPick}
                />
              </div>

              {fileError ? (
                <p role="alert" className="flex items-center gap-2 text-small font-medium text-danger">
                  <Icon name="CircleAlert" className="size-4" aria-hidden />
                  {fileError}
                </p>
              ) : null}

              {validated ? (
                <div className="flex flex-col gap-3 rounded-[12px] border border-success/30 bg-success/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex min-w-0 items-center gap-2 text-small font-semibold text-text-primary">
                      <Icon name="FileText" className="size-4 shrink-0 text-success" aria-hidden />
                      <span className="truncate">{validated.file.name}</span>
                    </p>
                    <span className="text-xs text-text-secondary">{formatBytes(validated.file.size)}</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <DetectedStat label="Detected pages" value={String(validated.pageCount)} />
                    <DetectedStat label="Detected type" value="Mixed" />
                    <DetectedStat label="Languages" value="TR, EN" />
                    <DetectedStat label="Validation" value="Passed" />
                  </dl>
                  <p className="text-xs italic text-text-secondary">
                    Estimated (demo) — page count, type and languages are inferred locally, not from a
                    real PDF parse.
                  </p>
                </div>
              ) : null}
            </div>
          </AdminSection>

          <AdminSection
            title="Import configuration"
            description="Tune how the (simulated) extraction interprets the document."
            icon="Settings"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Default language" htmlFor="defaultLanguage">
                <Select id="defaultLanguage" {...register("defaultLanguage")}>
                  {IMPORT_LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {LANGUAGE_LABELS[opt] ?? titleCase(opt)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Currency" htmlFor="currency">
                <Select id="currency" {...register("currency")}>
                  {IMPORT_CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "auto" ? "Auto-detect" : opt}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Existing menu behavior" htmlFor="existingMenuBehavior">
                <Select id="existingMenuBehavior" {...register("existingMenuBehavior")}>
                  {EXISTING_MENU_BEHAVIORS.map((opt) => (
                    <option key={opt} value={opt}>
                      {titleCase(opt)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Image handling" htmlFor="imageHandling">
                <Select id="imageHandling" {...register("imageHandling")}>
                  {IMAGE_HANDLING_MODES.map((opt) => (
                    <option key={opt} value={opt}>
                      {titleCase(opt)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Extraction mode"
                htmlFor="extractionMode"
                hint="Maximum accuracy favours thoroughness over speed."
              >
                <Select id="extractionMode" {...register("extractionMode")}>
                  {EXTRACTION_MODES.map((opt) => (
                    <option key={opt} value={opt}>
                      {titleCase(opt)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-text-secondary">
                Starting an import runs OCR on the PDF (this can take a few seconds per page). You
                will review the results before anything reaches the draft menu.
              </p>
              <Button type="submit" disabled={!validated || submitting}>
                {submitting ? (
                  <Icon name="Loader2" className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Icon name="Play" className="size-4" aria-hidden />
                )}
                {submitting ? "Reading PDF…" : "Start Import"}
              </Button>
            </div>
          </AdminSection>
        </form>
      </PermissionGate>

      <AdminSection
        title="Import history"
        description="Past and in-progress imports for this restaurant."
        icon="History"
      >
        {visibleImports.length === 0 ? (
          <EmptyState
            title="No imports yet"
            description="Upload a menu PDF above to create your first import."
            icon="Inbox"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-small">
              <caption className="sr-only">Import history for this restaurant</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-text-tertiary">
                  <th scope="col" className="py-2 pr-3 font-semibold">File</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Uploaded</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Status</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Review</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Categories</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Products</th>
                  <th scope="col" className="px-3 py-2 font-semibold">Warnings</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleImports.map((imp) => {
                  const stats = imp.result?.statistics;
                  return (
                    <tr key={imp.id} className="border-b border-border last:border-0">
                      <th scope="row" className="max-w-[220px] py-3 pr-3 font-medium text-text-primary">
                        <span className="block truncate">{imp.originalFileName}</span>
                      </th>
                      <td className="px-3 py-3 text-text-secondary">{formatDate(imp.createdAt)}</td>
                      <td className="px-3 py-3"><ProcessingStatusBadge status={imp.processingStatus} /></td>
                      <td className="px-3 py-3"><ReviewStatusBadge status={imp.reviewStatus} /></td>
                      <td className="px-3 py-3 text-text-secondary">{stats?.categoryCount ?? "—"}</td>
                      <td className="px-3 py-3 text-text-secondary">{stats?.productCount ?? "—"}</td>
                      <td className="px-3 py-3 text-text-secondary">
                        {stats ? stats.blockingWarnings + stats.reviewWarnings : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={routes.admin.restaurantMenuImportDetail(id, imp.id)}>
                              Open review
                            </Link>
                          </Button>
                          <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_ARCHIVE}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Archive import ${imp.originalFileName}`}
                              onClick={() => setArchiveTarget(imp)}
                            >
                              <Icon name="Archive" className="size-4" aria-hidden />
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      <ConfirmationDialog
        open={archiveTarget !== null}
        title="Archive this import?"
        description={`"${archiveTarget?.originalFileName}" will be hidden from the active history. This does not affect any committed menu items.`}
        confirmLabel="Archive"
        intent="danger"
        icon="Archive"
        onConfirm={onArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}

function DetectedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-canvas px-3 py-2">
      <dt className="text-[11px] uppercase tracking-wide text-text-tertiary">{label}</dt>
      <dd className="text-small font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
