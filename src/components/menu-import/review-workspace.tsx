"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/utils";
import type { AdminUser } from "@/domain/entities";
import type {
  CategoryCandidate,
  ImportResult,
  ImportWarning,
  MenuImport,
  ProductCandidate,
  WarningSeverity,
} from "@/domain/menu-import";
import { SEVERITY_META, WARNING_SEVERITIES } from "@/domain/menu-import";
import { PERMISSIONS } from "@/domain/permissions";
import { menuImportService } from "@/features/menu-import/service";
import { validateImportResult, buildQualityReport } from "@/features/menu-import/validation";
import { parsePrice } from "@/features/menu-import/price-normalization";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Checkbox, Label } from "@/components/ui/input";
import { Icon } from "@/components/shared/icon";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useToast } from "@/components/ui/toast";
import { ReviewTabs, type ReviewTab } from "@/components/menu-import/review-tabs";
import { ConfidenceChip, SeverityBadge } from "@/components/menu-import/import-chips";

interface ReviewWorkspaceProps {
  record: MenuImport;
  restaurantId: string;
  importId: string;
  user: AdminUser | null;
}

type TabId = "overview" | "categories" | "prices" | "images" | "warnings" | "json" | "summary";

export function ReviewWorkspace({ record, restaurantId, importId, user }: ReviewWorkspaceProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = useState<TabId>("overview");

  // `record.result` is guaranteed present by the parent for the review view.
  const result = record.result as ImportResult;

  const validation = useMemo(() => validateImportResult(result), [result]);
  const unresolvedBlocking = validation.unresolvedBlocking;

  const warningCounts = useMemo(() => {
    const blocking = result.warnings.filter((w) => w.severity === "BLOCKING" && !w.resolved).length;
    const total = result.warnings.length;
    return { blocking, total };
  }, [result.warnings]);

  /** Persist a mutated result back to the store. */
  const save = (updated: ImportResult) => {
    menuImportService.saveResult(importId, updated);
  };

  const updateProduct = (
    categoryId: string,
    candidateId: string,
    patch: Partial<ProductCandidate>,
  ) => {
    const updated: ImportResult = {
      ...result,
      categories: result.categories.map((cat) =>
        cat.candidateId !== categoryId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.candidateId === candidateId ? { ...item, ...patch } : item,
              ),
            },
      ),
    };
    save(updated);
  };

  const updateCategory = (categoryId: string, patch: Partial<CategoryCandidate>) => {
    const updated: ImportResult = {
      ...result,
      categories: result.categories.map((cat) =>
        cat.candidateId === categoryId ? { ...cat, ...patch } : cat,
      ),
    };
    save(updated);
  };

  const resolveWarning = (warningId: string) => {
    menuImportService.resolveWarning(importId, warningId, user?.id ?? null);
    toast({ title: "Warning resolved", intent: "success" });
  };

  const onApprove = () => {
    const outcome = menuImportService.approve(importId, user?.id ?? null);
    if (!outcome.ok) {
      toast({ title: "Cannot approve yet", description: outcome.reason, intent: "danger" });
      return;
    }
    toast({ title: "Import approved", description: "Ready to commit to the draft menu.", intent: "success" });
  };

  const onCommit = () => {
    const outcome = menuImportService.commit(importId, {
      id: user?.id ?? null,
      role: user?.role ?? "menu-editor",
    });
    if (!outcome.ok) {
      toast({ title: "Commit failed", description: outcome.reason, intent: "danger" });
      return;
    }
    const created = outcome.created;
    toast({
      title: "Imported into draft menu",
      description: created
        ? `Imported ${created.categories} categories / ${created.products} products into the draft menu (published menu unchanged).`
        : undefined,
      intent: "success",
    });
    router.push(routes.admin.restaurantMenu(restaurantId));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.originalFileName.replace(/\.pdf$/i, "")}-import.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const isApproved = record.processingStatus === "READY_TO_IMPORT";

  const tabs: ReviewTab[] = [
    { id: "overview", label: "Overview", icon: "LayoutDashboard" },
    { id: "categories", label: "Categories & Products", icon: "ListTree" },
    { id: "prices", label: "Prices", icon: "Tag" },
    { id: "images", label: "Images", icon: "Image" },
    {
      id: "warnings",
      label: "Warnings",
      icon: "TriangleAlert",
      count: warningCounts.total,
      alert: warningCounts.blocking > 0,
    },
    { id: "json", label: "JSON Preview", icon: "Braces" },
    { id: "summary", label: "Summary", icon: "ClipboardCheck" },
  ];

  const panelId = (id: TabId) => `review-panel-${id}`;

  return (
    <div className="flex flex-col gap-5">
      {unresolvedBlocking.length > 0 ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[12px] border border-danger/30 bg-danger/5 p-3 text-small text-danger"
        >
          <Icon name="OctagonAlert" className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {unresolvedBlocking.length} blocking warning(s) must be resolved before this import can
            be approved. See the Warnings tab.
          </span>
        </div>
      ) : null}

      <ReviewTabs tabs={tabs} active={active} onChange={(id) => setActive(id as TabId)} panelIdPrefix="review" />

      <div role="tabpanel" id={panelId(active)} aria-labelledby={`review-tab-${active}`}>
        {active === "overview" ? <OverviewPanel result={result} /> : null}
        {active === "categories" ? (
          <CategoriesPanel
            result={result}
            user={user}
            onUpdateProduct={updateProduct}
            onUpdateCategory={updateCategory}
          />
        ) : null}
        {active === "prices" ? (
          <PricesPanel result={result} user={user} onUpdateProduct={updateProduct} />
        ) : null}
        {active === "images" ? (
          <ImagesPanel result={result} user={user} onUpdateProduct={updateProduct} />
        ) : null}
        {active === "warnings" ? (
          <WarningsPanel result={result} user={user} onResolve={resolveWarning} />
        ) : null}
        {active === "json" ? <JsonPanel result={result} onDownload={downloadJson} /> : null}
        {active === "summary" ? <SummaryPanel result={result} /> : null}
      </div>

      <StickyActionBar
        info={
          <span className="flex items-center gap-2">
            <Icon
              name={validation.ok ? "CircleCheck" : "TriangleAlert"}
              className={validation.ok ? "size-4 text-success" : "size-4 text-warning"}
              aria-hidden
            />
            {validation.selectedProducts} product(s) selected ·{" "}
            {unresolvedBlocking.length} unresolved blocking warning(s)
          </span>
        }
      >
        {!isApproved ? (
          <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_APPROVE}>
            <Button type="button" onClick={onApprove} disabled={!validation.ok}>
              <Icon name="CircleCheck" className="size-4" aria-hidden />
              Approve import
            </Button>
          </PermissionGate>
        ) : (
          <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_COMMIT}>
            <Button type="button" onClick={onCommit}>
              <Icon name="DatabaseZap" className="size-4" aria-hidden />
              Commit to draft menu
            </Button>
          </PermissionGate>
        )}
      </StickyActionBar>
    </div>
  );
}

function OverviewPanel({ result }: { result: ImportResult }) {
  const s = result.statistics;
  const completeness = Math.round(s.estimatedCompleteness * 100);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AdminMetricCard label="Categories" value={s.categoryCount} icon="FolderTree" />
        <AdminMetricCard label="Products" value={s.productCount} icon="Pizza" />
        <AdminMetricCard label="Images" value={s.imageCount} icon="Image" />
        <AdminMetricCard
          label="Estimated completeness"
          value={`${completeness}%`}
          icon="Gauge"
          intent="primary"
        />
        <AdminMetricCard label="High confidence fields" value={s.highConfidenceFields} icon="ShieldCheck" intent="success" />
        <AdminMetricCard label="Medium confidence fields" value={s.mediumConfidenceFields} icon="ShieldAlert" intent="warning" />
        <AdminMetricCard label="Low confidence fields" value={s.lowConfidenceFields} icon="ShieldX" />
        <AdminMetricCard
          label="Blocking warnings"
          value={s.blockingWarnings}
          icon="OctagonAlert"
          intent={s.blockingWarnings > 0 ? "warning" : "neutral"}
        />
        <AdminMetricCard label="Review warnings" value={s.reviewWarnings} icon="TriangleAlert" intent="warning" />
      </div>
      <p className="text-xs italic text-text-secondary">
        Estimated extraction completeness — not guaranteed accuracy. Review every field before
        approval.
      </p>
    </div>
  );
}

function CategoriesPanel({
  result,
  user,
  onUpdateProduct,
  onUpdateCategory,
}: {
  result: ImportResult;
  user: AdminUser | null;
  onUpdateProduct: (categoryId: string, candidateId: string, patch: Partial<ProductCandidate>) => void;
  onUpdateCategory: (categoryId: string, patch: Partial<CategoryCandidate>) => void;
}) {
  if (result.categories.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-8 text-center text-small text-text-secondary">
        No categories were detected.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {result.categories.map((cat) => (
        <AdminSection
          key={cat.candidateId}
          title={cat.name.value}
          description={`${cat.items.length} item(s)`}
          icon="FolderClosed"
          actions={<ConfidenceChip value={cat.confidence} />}
        >
          <PermissionGate
            user={user}
            permission={PERMISSIONS.MENU_IMPORT_EDIT}
            fallback={
              <p className="text-xs text-text-secondary">You can review but not edit these candidates.</p>
            }
          >
            <div className="mb-4 flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor={`cat-name-${cat.candidateId}`}>Category name</Label>
                <Input
                  id={`cat-name-${cat.candidateId}`}
                  defaultValue={cat.name.value}
                  className="mt-1.5"
                  onBlur={(e) => {
                    if (e.target.value !== cat.name.value) {
                      onUpdateCategory(cat.candidateId, {
                        name: { ...cat.name, value: e.target.value, manuallyCorrected: true },
                      });
                    }
                  }}
                />
              </div>
              <label className="flex min-h-11 items-center gap-2 text-small text-text-primary">
                <Checkbox
                  checked={cat.selectedForImport}
                  onChange={(e) => onUpdateCategory(cat.candidateId, { selectedForImport: e.target.checked })}
                />
                Include category
              </label>
            </div>
          </PermissionGate>

          <ul className="flex flex-col gap-3">
            {cat.items.map((item) => (
              <ProductEditor
                key={item.candidateId}
                item={item}
                user={user}
                onUpdate={(patch) => onUpdateProduct(cat.candidateId, item.candidateId, patch)}
              />
            ))}
          </ul>
        </AdminSection>
      ))}
    </div>
  );
}

function ProductEditor({
  item,
  user,
  onUpdate,
}: {
  item: ProductCandidate;
  user: AdminUser | null;
  onUpdate: (patch: Partial<ProductCandidate>) => void;
}) {
  const isLow = item.confidence < 0.7;
  const rejected = item.reviewState === "rejected";
  const currency = item.basePrice?.currency ?? "USD";
  return (
    <li
      className={`flex flex-col gap-3 rounded-[12px] border p-3 ${
        rejected
          ? "border-border bg-surface-muted opacity-70"
          : isLow
            ? "border-danger/30 bg-danger/5"
            : "border-border bg-canvas"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-text-primary">{item.name.value}</p>
        <div className="flex items-center gap-2">
          <span className="text-small font-semibold text-text-primary">
            {formatPrice(item.basePrice?.amount, currency)}
          </span>
          <ConfidenceChip value={item.confidence} />
        </div>
      </div>

      <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_EDIT}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`name-${item.candidateId}`}>Name</Label>
            <Input
              id={`name-${item.candidateId}`}
              defaultValue={item.name.value}
              className="mt-1.5"
              disabled={rejected}
              onBlur={(e) => {
                if (e.target.value !== item.name.value) {
                  onUpdate({ name: { ...item.name, value: e.target.value, manuallyCorrected: true } });
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor={`price-${item.candidateId}`}>Base price ({currency})</Label>
            <Input
              id={`price-${item.candidateId}`}
              type="number"
              step="0.01"
              defaultValue={item.basePrice?.amount ?? 0}
              className="mt-1.5"
              disabled={rejected}
              onBlur={(e) => {
                const amount = Number(e.target.value);
                if (!Number.isFinite(amount)) return;
                const base = item.basePrice ?? {
                  originalText: String(amount),
                  amount,
                  currency,
                  type: "BASE" as const,
                  confidence: 1,
                };
                if (amount !== base.amount || !item.basePrice) {
                  onUpdate({ basePrice: { ...base, amount, confidence: 1 } });
                }
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`desc-${item.candidateId}`}>Description</Label>
            <Textarea
              id={`desc-${item.candidateId}`}
              defaultValue={item.description?.value ?? ""}
              className="mt-1.5 min-h-16"
              disabled={rejected}
              onBlur={(e) => {
                const value = e.target.value;
                if (value !== (item.description?.value ?? "")) {
                  onUpdate({
                    description: value
                      ? { value, confidence: item.description?.confidence ?? 1, manuallyCorrected: true }
                      : null,
                  });
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex min-h-11 items-center gap-2 text-small text-text-primary">
            <Checkbox
              checked={item.available}
              disabled={rejected}
              onChange={(e) => onUpdate({ available: e.target.checked })}
            />
            Available
          </label>
          <label className="flex min-h-11 items-center gap-2 text-small text-text-primary">
            <Checkbox
              checked={item.selectedForImport}
              disabled={rejected}
              onChange={(e) => onUpdate({ selectedForImport: e.target.checked })}
            />
            Include in import
          </label>
          <Button
            type="button"
            variant={rejected ? "outline" : "ghost"}
            size="sm"
            className="ml-auto"
            onClick={() =>
              onUpdate({
                reviewState: rejected ? "edited" : "rejected",
                selectedForImport: rejected ? true : false,
              })
            }
          >
            <Icon name={rejected ? "RotateCcw" : "Ban"} className="size-4" aria-hidden />
            {rejected ? "Restore" : "Reject"}
          </Button>
        </div>
      </PermissionGate>
    </li>
  );
}

function PricesPanel({
  result,
  user,
  onUpdateProduct,
}: {
  result: ImportResult;
  user: AdminUser | null;
  onUpdateProduct: (categoryId: string, candidateId: string, patch: Partial<ProductCandidate>) => void;
}) {
  const rows = result.categories.flatMap((cat) =>
    cat.items.map((item) => ({ categoryId: cat.candidateId, categoryName: cat.name.value, item })),
  );
  if (rows.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-8 text-center text-small text-text-secondary">
        No products with prices were detected.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-[16px] border border-border bg-canvas shadow-card">
      <table className="w-full min-w-[760px] border-collapse text-left text-small">
        <caption className="sr-only">Extracted prices</caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-tertiary">
            <th scope="col" className="px-4 py-2 font-semibold">Product</th>
            <th scope="col" className="px-4 py-2 font-semibold">Original text</th>
            <th scope="col" className="px-4 py-2 font-semibold">Parsed</th>
            <th scope="col" className="px-4 py-2 font-semibold">Currency</th>
            <th scope="col" className="px-4 py-2 font-semibold">Confidence</th>
            <th scope="col" className="px-4 py-2 font-semibold">Correct amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ categoryId, item }) => {
            const price = item.basePrice;
            const currency = price?.currency ?? result.restaurant.currency;
            return (
              <tr key={item.candidateId} className="border-b border-border last:border-0">
                <th scope="row" className="px-4 py-2 font-medium text-text-primary">{item.name.value}</th>
                <td className="px-4 py-2 font-mono text-xs text-text-secondary">
                  {price?.originalText ?? "—"}
                </td>
                <td className="px-4 py-2 text-text-primary">
                  {price ? formatPrice(price.amount, currency) : "—"}
                </td>
                <td className="px-4 py-2 text-text-secondary">{currency}</td>
                <td className="px-4 py-2">
                  <ConfidenceChip value={price?.confidence ?? item.confidence} />
                </td>
                <td className="px-4 py-2">
                  <PermissionGate
                    user={user}
                    permission={PERMISSIONS.MENU_IMPORT_EDIT}
                    fallback={<span className="text-xs text-text-tertiary">—</span>}
                  >
                    <Input
                      aria-label={`Correct price for ${item.name.value}`}
                      type="number"
                      step="0.01"
                      defaultValue={price?.amount ?? 0}
                      className="h-9 w-28"
                      onBlur={(e) => {
                        const amount = Number(e.target.value);
                        if (!Number.isFinite(amount)) return;
                        const parsed = parsePrice(e.target.value, { defaultCurrency: currency });
                        const base = price ?? {
                          originalText: e.target.value,
                          amount,
                          currency,
                          type: "BASE" as const,
                          confidence: 1,
                        };
                        if (amount !== base.amount || !price) {
                          onUpdateProduct(categoryId, item.candidateId, {
                            basePrice: {
                              ...base,
                              amount,
                              currency: parsed?.currency ?? currency,
                              confidence: 1,
                            },
                          });
                        }
                      }}
                    />
                  </PermissionGate>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ImagesPanel({
  result,
  user,
  onUpdateProduct,
}: {
  result: ImportResult;
  user: AdminUser | null;
  onUpdateProduct: (categoryId: string, candidateId: string, patch: Partial<ProductCandidate>) => void;
}) {
  const withImages = result.categories.flatMap((cat) =>
    cat.items
      .filter((item) => item.image)
      .map((item) => ({ categoryId: cat.candidateId, item })),
  );
  if (withImages.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-8 text-center text-small text-text-secondary">
        No product images were extracted.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {withImages.map(({ categoryId, item }) => {
        const image = item.image!;
        return (
          <div key={item.candidateId} className="flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-3 shadow-card">
            <div className="relative h-40 w-full overflow-hidden rounded-[12px] bg-surface">
              <Image
                src={image.temporaryUrl || "/placeholders/food.svg"}
                alt={item.name.value}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover"
              />
            </div>
            <p className="truncate font-medium text-text-primary">{item.name.value}</p>
            <div className="flex flex-wrap items-center gap-2">
              <ConfidenceChip value={image.confidence} />
              {image.requiresReview ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                  <Icon name="Eye" className="size-3" aria-hidden />
                  Needs review
                </span>
              ) : null}
            </div>
            <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_EDIT}>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onUpdateProduct(categoryId, item.candidateId, {
                      image: {
                        ...image,
                        requiresReview: false,
                        matchingSignals: [...(image.matchingSignals ?? []), "manually-approved"],
                      },
                    })
                  }
                >
                  <Icon name="Check" className="size-4" aria-hidden />
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateProduct(categoryId, item.candidateId, { image: null })}
                >
                  <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                  Remove image
                </Button>
              </div>
            </PermissionGate>
          </div>
        );
      })}
    </div>
  );
}

function WarningsPanel({
  result,
  user,
  onResolve,
}: {
  result: ImportResult;
  user: AdminUser | null;
  onResolve: (warningId: string) => void;
}) {
  if (result.warnings.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-8 text-center text-small text-text-secondary">
        No warnings were raised.
      </p>
    );
  }
  const grouped = WARNING_SEVERITIES.map((severity) => ({
    severity,
    items: result.warnings.filter((w) => w.severity === severity),
  })).filter((g) => g.items.length > 0);

  // Show most severe first.
  const order: WarningSeverity[] = ["BLOCKING", "REVIEW", "INFO"];
  grouped.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return (
    <div className="flex flex-col gap-5">
      {grouped.map((group) => (
        <AdminSection
          key={group.severity}
          title={`${SEVERITY_META[group.severity].label} (${group.items.length})`}
          icon={SEVERITY_META[group.severity].icon}
        >
          <ul className="flex flex-col gap-3">
            {group.items.map((warning) => (
              <WarningRow key={warning.id} warning={warning} user={user} onResolve={onResolve} />
            ))}
          </ul>
        </AdminSection>
      ))}
    </div>
  );
}

function WarningRow({
  warning,
  user,
  onResolve,
}: {
  warning: ImportWarning;
  user: AdminUser | null;
  onResolve: (warningId: string) => void;
}) {
  return (
    <li
      className={`flex flex-col gap-2 rounded-[12px] border p-3 ${
        warning.resolved ? "border-border bg-surface-muted" : "border-border bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={warning.severity} />
          <code className="rounded bg-surface-container px-1.5 py-0.5 text-xs text-text-secondary">
            {warning.code}
          </code>
        </div>
        {warning.resolved ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
            <Icon name="CircleCheck" className="size-3.5" aria-hidden />
            Resolved
          </span>
        ) : (
          <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_REVIEW}>
            <Button type="button" variant="outline" size="sm" onClick={() => onResolve(warning.id)}>
              <Icon name="Check" className="size-4" aria-hidden />
              Resolve
            </Button>
          </PermissionGate>
        )}
      </div>
      <p className="text-small text-text-primary">{warning.message}</p>
      {warning.suggestedCorrection ? (
        <p className="text-xs text-text-secondary">
          <span className="font-semibold">Suggested:</span> {warning.suggestedCorrection}
        </p>
      ) : null}
      <p className="text-xs text-text-tertiary">
        Affects: {warning.entityType}
        {warning.field ? ` · ${warning.field}` : ""}
        {warning.entityCandidateId ? ` · ${warning.entityCandidateId}` : ""}
      </p>
    </li>
  );
}

function JsonPanel({ result, onDownload }: { result: ImportResult; onDownload: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onDownload}>
          <Icon name="Download" className="size-4" aria-hidden />
          Download JSON
        </Button>
      </div>
      <pre className="max-h-[28rem] overflow-auto rounded-[12px] border border-border bg-navy-deep p-4 text-xs leading-relaxed text-surface">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function SummaryPanel({ result }: { result: ImportResult }) {
  const report = buildQualityReport(result);
  const rows: { label: string; value: string | number }[] = [
    { label: "Pages processed", value: report.pagesProcessed },
    { label: "Pages requiring OCR", value: report.pagesRequiringOcr },
    { label: "Categories detected", value: report.categoriesDetected },
    { label: "Products detected", value: report.productsDetected },
    { label: "Products without category", value: report.productsWithoutCategory },
    { label: "Products without price", value: report.productsWithoutPrice },
    { label: "Images extracted", value: report.imagesExtracted },
    { label: "Unassigned images", value: report.unassignedImages },
    { label: "High confidence fields", value: report.highConfidenceFields },
    { label: "Medium confidence fields", value: report.mediumConfidenceFields },
    { label: "Low confidence fields", value: report.lowConfidenceFields },
    { label: "Blocking warnings", value: report.blockingWarnings },
    { label: "Review warnings", value: report.reviewWarnings },
    { label: "Manual corrections", value: report.manualCorrections },
    { label: "AI-assisted pages", value: report.aiAssistedPages },
    { label: "Failed pages", value: report.failedPages },
    {
      label: "Estimated completeness",
      value: `${Math.round(report.estimatedCompleteness * 100)}%`,
    },
  ];
  return (
    <AdminSection
      title="Quality report"
      description="Estimated extraction quality — not a guarantee of accuracy."
      icon="ClipboardCheck"
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 border-b border-border py-1.5 text-small last:border-0"
          >
            <dt className="text-text-secondary">{row.label}</dt>
            <dd className="font-semibold text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-xs text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        Approve to lock the review, then commit to create draft categories and products. The
        published menu is never changed by an import.
      </p>
    </AdminSection>
  );
}
