"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import { appConfig } from "@/lib/config/app-config";
import type { Restaurant } from "@/domain/entities";
import type { MenuImport } from "@/domain/menu-import";
import {
  IMPORT_PIPELINE_STAGES,
  STAGE_META,
  type ImportPipelineStage,
} from "@/domain/menu-import";
import { PERMISSIONS } from "@/domain/permissions";
import { menuImportService } from "@/features/menu-import/service";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useToast } from "@/components/ui/toast";
import { ProcessingStatusBadge, ReviewStatusBadge } from "@/components/menu-import/import-chips";
import { ImportProgressBar } from "@/components/menu-import/import-progress-bar";
import { ReviewWorkspace } from "@/components/menu-import/review-workspace";

const REVIEW_STATUSES = ["REVIEW_REQUIRED", "READY_TO_IMPORT"] as const;

export default function MenuImportDetailPage() {
  const params = useParams<{ restaurantId: string; importId: string }>();
  const restaurantId = params.restaurantId;
  const importId = params.importId;
  const router = useRouter();
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [record, setRecord] = useState<MenuImport | null>(null);
  const [ready, setReady] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const startedRef = useRef(false);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(restaurantId));
    setRecord(menuImportService.get(importId));
    setReady(true);
  }, [restaurantId, importId]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  // Kick off the simulated extraction exactly once when freshly uploaded.
  useEffect(() => {
    if (startedRef.current) return;
    const rec = menuImportService.get(importId);
    if (rec && rec.processingStatus === "UPLOADED") {
      startedRef.current = true;
      void menuImportService.startExtraction(importId);
    }
  }, [importId, ready]);

  const onCancel = () => {
    menuImportService.cancel(importId);
    toast({ title: "Import cancelled", intent: "info" });
    setCancelOpen(false);
  };

  // Real OCR needs the original file, which only the upload page holds. Send the
  // user back there to re-pick it rather than running the simulated fallback.
  const onRetry = () => {
    router.push(routes.admin.restaurantMenuImport(restaurantId));
  };

  if (ready && !record) {
    return (
      <EmptyState
        title="Import not found"
        description="This import may have been removed or never existed."
        icon="FileX"
      >
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurantMenuImport(restaurantId)}>Back to imports</Link>
        </Button>
      </EmptyState>
    );
  }

  if (!record || !restaurant) {
    return (
      <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
        Loading…
      </div>
    );
  }

  const status = record.processingStatus;
  const isReview = (REVIEW_STATUSES as readonly string[]).includes(status) && record.result !== null;
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";
  const isCancelled = status === "CANCELLED";
  const isProgress = !isReview && !isCompleted && !isFailed && !isCancelled;

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader
        restaurant={restaurant}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(restaurantId) },
          { label: "Menu", href: routes.admin.restaurantMenu(restaurantId) },
          { label: "Import", href: routes.admin.restaurantMenuImport(restaurantId) },
          { label: record.originalFileName },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.restaurantMenuImport(restaurantId)}>
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              All imports
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-canvas p-3 shadow-card">
        <Icon name="FileText" className="size-4 text-text-secondary" aria-hidden />
        <span className="text-small font-medium text-text-primary">{record.originalFileName}</span>
        <ProcessingStatusBadge status={record.processingStatus} />
        <ReviewStatusBadge status={record.reviewStatus} />
        <span className="ml-auto text-xs text-text-secondary">
          Uploaded {formatDate(record.createdAt)}
        </span>
      </div>

      {isProgress ? (
        <ProgressView record={record} onCancel={() => setCancelOpen(true)} user={user} />
      ) : null}

      {isReview ? (
        <ReviewWorkspace
          record={record}
          restaurantId={restaurantId}
          importId={importId}
          user={user}
        />
      ) : null}

      {isCompleted ? <CompletedView record={record} restaurantId={restaurantId} /> : null}

      {isFailed ? (
        <>
          <ErrorState
            title="Extraction failed"
            description={
              record.errorSummary ??
              "The OCR extraction job did not complete. Re-upload the PDF to try again."
            }
          />
          <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_RETRY}>
            <div className="flex justify-center">
              <Button onClick={onRetry}>
                <Icon name="RotateCcw" className="size-4" aria-hidden />
                Re-upload PDF
              </Button>
            </div>
          </PermissionGate>
        </>
      ) : null}

      {isCancelled ? (
        <ErrorState
          title="Import cancelled"
          description="This import was cancelled before completion. Start a new import from the upload page if needed."
        />
      ) : null}

      <ConfirmationDialog
        open={cancelOpen}
        title="Cancel this import?"
        description="The simulated extraction will stop. You can start a new import at any time."
        confirmLabel="Cancel import"
        cancelLabel="Keep running"
        intent="danger"
        icon="Ban"
        onConfirm={onCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}

function ProgressView({
  record,
  onCancel,
  user,
}: {
  record: MenuImport;
  onCancel: () => void;
  user: ReturnType<typeof useAdminUser>;
}) {
  const currentStage = record.currentStage;
  const latestEvents = [...record.events].slice(-6).reverse();
  const stageIndex = IMPORT_PIPELINE_STAGES.indexOf(currentStage as ImportPipelineStage);
  const latestEvent = record.events[record.events.length - 1];
  const warningCount = record.events.reduce((n, e) => n + (e.warningCount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Simulated extraction in progress — no real OCR runs. Stage names are shown without a
          fabricated completion time.
        </span>
      </div>

      <AdminSection title="Extraction progress" description="Live pipeline status." icon="Loader2">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-small">
              <span className="font-semibold text-text-primary">{record.progress}% complete</span>
              {latestEvent?.totalPages ? (
                <span className="text-text-secondary">
                  Page {latestEvent.page ?? 0} of {latestEvent.totalPages}
                </span>
              ) : null}
            </div>
            <ImportProgressBar value={record.progress} />
            <p aria-live="polite" className="text-xs text-text-secondary">
              {latestEvent ? latestEvent.message : "Queued"}
              {warningCount > 0 ? ` · ${warningCount} warning(s) so far` : ""}
            </p>
          </div>

          <ol className="flex flex-col gap-1.5">
            {IMPORT_PIPELINE_STAGES.map((stage, idx) => {
              const meta = STAGE_META[stage];
              const isCurrent = stage === currentStage;
              const isDone = stageIndex >= 0 && idx < stageIndex;
              return (
                <li
                  key={stage}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-[10px] border px-3 py-2 ${
                    isCurrent
                      ? "border-primary bg-surface-warm"
                      : "border-border bg-surface"
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      isDone
                        ? "bg-success/15 text-success"
                        : isCurrent
                          ? "bg-primary text-white"
                          : "bg-surface-muted text-text-tertiary"
                    }`}
                  >
                    {isDone ? (
                      <Icon name="Check" className="size-3.5" aria-hidden />
                    ) : isCurrent ? (
                      <Icon name="Loader2" className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={`text-small ${isCurrent ? "font-semibold text-text-primary" : "text-text-secondary"}`}
                  >
                    {meta.label}
                  </span>
                  {isCurrent ? (
                    <span className="ml-auto text-xs font-medium text-primary">In progress…</span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </AdminSection>

      <AdminSection title="Recent events" description="The latest pipeline events." icon="ListTree">
        <ul className="flex flex-col gap-2">
          {latestEvents.map((evt) => (
            <li
              key={evt.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-3 py-2 text-small"
            >
              <span className="text-text-primary">{evt.message}</span>
              <span className="shrink-0 text-xs text-text-tertiary">
                {formatDate(evt.createdAt, "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      </AdminSection>

      <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_CANCEL}>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            <Icon name="Ban" className="size-4" aria-hidden />
            Cancel import
          </Button>
        </div>
      </PermissionGate>
    </div>
  );
}

function CompletedView({ record, restaurantId }: { record: MenuImport; restaurantId: string }) {
  const stats = record.result?.statistics;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-[16px] border border-success/30 bg-success/5 px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <Icon name="CircleCheckBig" className="size-6" aria-hidden />
        </span>
        <h2 className="font-heading text-h2 text-text-primary">Imported into the draft menu</h2>
        <p className="max-w-md text-small text-text-secondary">
          {stats
            ? `${stats.categoryCount} categories and ${stats.productCount} products were created as drafts. The published menu was not changed.`
            : "Items were committed to the draft menu. The published menu was not changed."}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href={routes.admin.restaurantMenu(restaurantId)}>
              <Icon name="BookOpen" className="size-4" aria-hidden />
              View draft menu
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.admin.restaurantMenuImport(restaurantId)}>Back to imports</Link>
          </Button>
        </div>
      </div>

      {record.result ? (
        <AdminSection title="Extraction JSON" description="The committed result, read-only." icon="Braces">
          <pre className="max-h-96 overflow-auto rounded-[12px] border border-border bg-navy-deep p-4 text-xs leading-relaxed text-surface">
            {JSON.stringify(record.result, null, 2)}
          </pre>
        </AdminSection>
      ) : null}

      {appConfig.demoMode ? (
        <p className="text-center text-xs text-text-tertiary">
          Demo data — extraction was simulated, not produced by real OCR.
        </p>
      ) : null}
    </div>
  );
}
