"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { qrCodeSchema, type QRCodeInput } from "@/domain/schemas";
import { QR_STATUSES, ARTWORK_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import type { QRCodeRecord, Restaurant } from "@/domain/entities";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { getRestaurantAnalytics } from "@/data/analytics/actions";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const ARTWORK_LABELS: Record<(typeof ARTWORK_STATUSES)[number], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  ready: "Ready",
  printed: "Printed",
};

const ARTWORK_INTENT: Record<(typeof ARTWORK_STATUSES)[number], string> = {
  "not-started": "bg-surface-muted text-text-secondary",
  "in-progress": "bg-warning/10 text-warning",
  ready: "bg-info/10 text-info",
  printed: "bg-success/10 text-success",
};

interface EditorState {
  mode: "create" | "edit";
  record: QRCodeRecord | null;
}

export default function RestaurantQRCodesPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [records, setRecords] = useState<QRCodeRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [realScans, setRealScans] = useState<number | null>(null);

  useEffect(() => {
    getRestaurantAnalytics(id, 30)
      .then((a) => setRealScans(a.totalScans))
      .catch(() => setRealScans(null));
  }, [id]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [artworkFilter, setArtworkFilter] = useState("all");

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [removeTarget, setRemoveTarget] = useState<QRCodeRecord | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ record: QRCodeRecord; next: "paused" | "retired" } | null>(null);

  const canManage = !!user && (user.permissions.length === 0 || user.permissions.includes(PERMISSIONS.QR_MANAGE));

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setRecords(demoStore.qr.where((q) => q.restaurantId === id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (q) {
        const hay = `${r.displayIdentifier} ${r.placement} ${r.destination}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (artworkFilter !== "all" && r.artworkStatus !== artworkFilter) return false;
      return true;
    });
  }, [records, search, statusFilter, artworkFilter]);

  const metrics = useMemo(
    () => ({
      total: records.length,
      active: records.filter((r) => r.status === "active").length,
      draft: records.filter((r) => r.status === "draft").length,
      attention: records.filter((r) => r.artworkStatus === "not-started" || r.artworkStatus === "in-progress")
        .length,
    }),
    [records],
  );

  const hasActiveFilters = search !== "" || statusFilter !== "all" || artworkFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setArtworkFilter("all");
  };

  const recordAudit = (action: string, resourceId: string, description: string) => {
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "qr-nfc-operations-manager",
      action,
      resourceType: "qr-code",
      resourceId,
      description,
    });
  };

  const handleSave = (input: QRCodeInput) => {
    if (!editor) return;
    if (editor.mode === "create") {
      const newId = createId("qr");
      const now = new Date().toISOString();
      const created: QRCodeRecord = {
        id: newId,
        restaurantId: id,
        displayIdentifier: input.displayIdentifier,
        placement: input.placement,
        destination: input.destination,
        status: input.status,
        artworkStatus: input.artworkStatus,
        createdAt: now,
        updatedAt: now,
      };
      demoStore.qr.create(created);
      recordAudit("qr.create", newId, `Created QR ${input.displayIdentifier}`);
      toast({ title: "QR record created", description: "Saved as a draft entry. Nothing was published.", intent: "success" });
    } else if (editor.record) {
      demoStore.qr.update(editor.record.id, {
        displayIdentifier: input.displayIdentifier,
        placement: input.placement,
        destination: input.destination,
        status: input.status,
        artworkStatus: input.artworkStatus,
        updatedAt: new Date().toISOString(),
      });
      recordAudit("qr.update", editor.record.id, `Updated QR ${input.displayIdentifier}`);
      toast({ title: "QR record updated", intent: "success" });
    }
    setEditor(null);
  };

  const handleStatusChange = () => {
    if (!statusTarget) return;
    demoStore.qr.update(statusTarget.record.id, {
      status: statusTarget.next,
      updatedAt: new Date().toISOString(),
    });
    recordAudit(
      `qr.${statusTarget.next === "paused" ? "pause" : "retire"}`,
      statusTarget.record.id,
      `${statusTarget.next === "paused" ? "Paused" : "Retired"} QR ${statusTarget.record.displayIdentifier}`,
    );
    toast({
      title: statusTarget.next === "paused" ? "QR paused" : "QR retired",
      description: "Public destinations are unaffected until you publish changes.",
      intent: "success",
    });
    setStatusTarget(null);
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    demoStore.qr.remove(removeTarget.id);
    recordAudit("qr.remove", removeTarget.id, `Removed QR ${removeTarget.displayIdentifier}`);
    toast({ title: "QR record removed", intent: "success" });
    setRemoveTarget(null);
  };

  const columns = useMemo<ColumnDef<QRCodeRecord, unknown>[]>(
    () => [
      {
        accessorKey: "displayIdentifier",
        header: "QR record",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-navy text-white">
              <Icon name="QrCode" className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary">{row.original.displayIdentifier}</p>
              <p className="text-xs text-text-secondary">{row.original.placement}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "destination",
        header: "Destination",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="block max-w-[220px] truncate text-small text-text-secondary" title={row.original.destination}>
            {row.original.destination}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="qr" value={row.original.status} />,
      },
      {
        accessorKey: "artworkStatus",
        header: "Artwork",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${ARTWORK_INTENT[row.original.artworkStatus]}`}
          >
            {ARTWORK_LABELS[row.original.artworkStatus]}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={`Download QR artwork for ${row.original.displayIdentifier}`}
            >
              <a
                href={`/api/qr-artwork?text=${encodeURIComponent(row.original.destination)}&name=${encodeURIComponent(row.original.displayIdentifier)}`}
              >
                <Icon name="Download" className="size-4" aria-hidden />
              </a>
            </Button>
            {canManage ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${row.original.displayIdentifier}`}
                  onClick={() => setEditor({ mode: "edit", record: row.original })}
                >
                  <Icon name="Pencil" className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Pause ${row.original.displayIdentifier}`}
                  disabled={row.original.status === "paused" || row.original.status === "retired"}
                  onClick={() => setStatusTarget({ record: row.original, next: "paused" })}
                >
                  <Icon name="PauseCircle" className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Retire ${row.original.displayIdentifier}`}
                  disabled={row.original.status === "retired"}
                  onClick={() => setStatusTarget({ record: row.original, next: "retired" })}
                >
                  <Icon name="Archive" className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${row.original.displayIdentifier}`}
                  onClick={() => setRemoveTarget(row.original)}
                >
                  <Icon name="Trash2" className="size-4" aria-hidden />
                </Button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage],
  );

  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [{ label: "All", value: "all" }, ...QR_STATUSES.map((s) => ({ label: titleCase(s), value: s }))],
    },
    {
      id: "artwork",
      label: "Artwork",
      value: artworkFilter,
      onChange: setArtworkFilter,
      options: [{ label: "All", value: "all" }, ...ARTWORK_STATUSES.map((s) => ({ label: ARTWORK_LABELS[s], value: s }))],
    },
  ];

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
          { label: "QR Codes" },
        ]}
        actions={
          <PermissionGate user={user} permission={PERMISSIONS.QR_MANAGE}>
            <Button size="sm" onClick={() => setEditor({ mode: "create", record: null })}>
              <Icon name="Plus" className="size-4" aria-hidden />
              Create QR
            </Button>
          </PermissionGate>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="ShieldCheck" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          QR records map physical codes to public destinations. Add{" "}
          <code className="rounded bg-info/10 px-1">?via=qr</code> to a destination to attribute scans
          in Analytics. Signing secrets and redirect keys are never shown here.
        </span>
      </div>

      <section aria-label="QR summary metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminMetricCard label="Total" value={metrics.total} icon="QrCode" />
        <AdminMetricCard label="Active" value={metrics.active} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Draft" value={metrics.draft} icon="FileEdit" />
        <AdminMetricCard label="Needs artwork" value={metrics.attention} icon="AlertTriangle" intent="warning" />
        <AdminMetricCard label="QR scans (30d)" value={realScans ?? 0} icon="Activity" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by identifier, placement or destination…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {records.length === 0 ? (
        <EmptyState
          title="No QR records yet"
          description="Create the first QR record to map a physical code to a public destination."
          icon="QrCode"
          action={canManage ? { label: "Create QR", onClick: () => setEditor({ mode: "create", record: null }) } : undefined}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="QR records"
          emptyState={
            <EmptyState
              title="No matches"
              description="No QR records match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      {editor ? (
        <QRCodeEditorDialog
          mode={editor.mode}
          record={editor.record}
          onCancel={() => setEditor(null)}
          onSave={handleSave}
        />
      ) : null}

      <ConfirmationDialog
        open={statusTarget !== null}
        title={statusTarget?.next === "paused" ? "Pause QR record?" : "Retire QR record?"}
        description={
          statusTarget?.next === "paused"
            ? `${statusTarget?.record.displayIdentifier} will be marked paused. Public destinations are unaffected until you publish.`
            : `${statusTarget?.record.displayIdentifier} will be retired. This is reversible and keeps the record.`
        }
        confirmLabel={statusTarget?.next === "paused" ? "Pause" : "Retire"}
        intent="danger"
        icon={statusTarget?.next === "paused" ? "PauseCircle" : "Archive"}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

      <ConfirmationDialog
        open={removeTarget !== null}
        title="Remove QR record?"
        description={`${removeTarget?.displayIdentifier} will be removed from this restaurant. This cannot be undone in the demo.`}
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function QRCodeEditorDialog({
  mode,
  record,
  onCancel,
  onSave,
}: {
  mode: "create" | "edit";
  record: QRCodeRecord | null;
  onCancel: () => void;
  onSave: (input: QRCodeInput) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof qrCodeSchema>, unknown, QRCodeInput>({
    resolver: zodResolver(qrCodeSchema),
    defaultValues: {
      displayIdentifier: record?.displayIdentifier ?? "",
      placement: record?.placement ?? "",
      destination: record?.destination ?? "",
      status: record?.status ?? "draft",
      artworkStatus: record?.artworkStatus ?? "not-started",
    },
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/40 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div className="w-full max-w-lg rounded-[20px] border border-border bg-canvas p-6 shadow-lift">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="qr-editor-title" className="font-display text-h3 text-text-primary">
            {mode === "create" ? "Create QR record" : "Edit QR record"}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onCancel}>
            <Icon name="X" className="size-4" aria-hidden />
          </Button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((input) => onSave(input))}
        >
          <Field label="Public identifier" htmlFor="qr-displayIdentifier" error={errors.displayIdentifier?.message} required>
            <Input id="qr-displayIdentifier" {...register("displayIdentifier")} autoFocus />
          </Field>
          <Field label="Placement" htmlFor="qr-placement" error={errors.placement?.message} required>
            <Input id="qr-placement" placeholder="e.g. Table tents" {...register("placement")} />
          </Field>
          <Field
            label="Destination"
            htmlFor="qr-destination"
            error={errors.destination?.message}
            hint="Internal path or approved HTTPS URL. No redirect secrets."
            required
          >
            <Input id="qr-destination" placeholder="/restaurants/pizza-house" {...register("destination")} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="qr-status" error={errors.status?.message}>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select id="qr-status" {...field}>
                    {QR_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s)}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Artwork" htmlFor="qr-artwork" error={errors.artworkStatus?.message}>
              <Controller
                control={control}
                name="artworkStatus"
                render={({ field }) => (
                  <Select id="qr-artwork" {...field}>
                    {ARTWORK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ARTWORK_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Create" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
