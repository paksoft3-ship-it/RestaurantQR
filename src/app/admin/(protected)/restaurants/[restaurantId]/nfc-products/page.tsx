"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { nfcProductSchema, type NFCProductInput } from "@/domain/schemas";
import {
  NFC_ASSIGNMENT_STATUSES,
  ARTWORK_STATUSES,
  OPERATIONAL_STATUSES,
} from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import type { NFCProduct, Restaurant } from "@/domain/entities";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { getRestaurantAnalytics } from "@/data/analytics/actions";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { useAdminUser } from "@/components/admin/admin-user-context";
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

const PRODUCT_TYPES = ["table-stand", "card", "sticker", "window"] as const;
const PRODUCT_TYPE_LABELS: Record<(typeof PRODUCT_TYPES)[number], string> = {
  "table-stand": "Table stand",
  card: "Card",
  sticker: "Sticker",
  window: "Window decal",
};

const ARTWORK_LABELS: Record<(typeof ARTWORK_STATUSES)[number], string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  ready: "Ready",
  printed: "Printed",
};

const OPERATIONAL_LABELS: Record<(typeof OPERATIONAL_STATUSES)[number], string> = {
  active: "Active",
  paused: "Paused",
  disabled: "Disabled",
};

interface EditorState {
  mode: "create" | "edit";
  record: NFCProduct | null;
}

export default function RestaurantNFCProductsPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [assigned, setAssigned] = useState<NFCProduct[]>([]);
  const [unassigned, setUnassigned] = useState<NFCProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [realTaps, setRealTaps] = useState<number | null>(null);

  useEffect(() => {
    getRestaurantAnalytics(id, 30)
      .then((a) => setRealTaps(a.totalTaps))
      .catch(() => setRealTaps(null));
  }, [id]);

  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [operationalFilter, setOperationalFilter] = useState("all");

  const [editor, setEditor] = useState<EditorState | null>(null);
  const [removeTarget, setRemoveTarget] = useState<NFCProduct | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<NFCProduct | null>(null);

  const canManage = !!user && (user.permissions.length === 0 || user.permissions.includes(PERMISSIONS.NFC_MANAGE));

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setAssigned(demoStore.nfc.where((n) => n.restaurantId === id));
    setUnassigned(demoStore.nfc.where((n) => n.restaurantId === null));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assigned.filter((r) => {
      if (q) {
        const hay = `${r.displayIdentifier} ${r.placement} ${PRODUCT_TYPE_LABELS[r.productType]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (assignmentFilter !== "all" && r.assignmentStatus !== assignmentFilter) return false;
      if (operationalFilter !== "all" && r.operationalStatus !== operationalFilter) return false;
      return true;
    });
  }, [assigned, search, assignmentFilter, operationalFilter]);

  const metrics = useMemo(
    () => ({
      total: assigned.length,
      active: assigned.filter((r) => r.operationalStatus === "active").length,
      reassign: assigned.filter((r) => r.assignmentStatus === "reassign-pending").length,
      unassigned: unassigned.length,
    }),
    [assigned, unassigned],
  );

  const hasActiveFilters = search !== "" || assignmentFilter !== "all" || operationalFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setAssignmentFilter("all");
    setOperationalFilter("all");
  };

  const recordAudit = (action: string, resourceId: string, description: string) => {
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "qr-nfc-operations-manager",
      action,
      resourceType: "nfc-product",
      resourceId,
      description,
    });
  };

  const handleSave = (input: NFCProductInput) => {
    if (!editor) return;
    const destination = input.destination && input.destination.length > 0 ? input.destination : null;
    if (editor.mode === "create") {
      const newId = createId("nfc");
      const created: NFCProduct = {
        id: newId,
        displayIdentifier: input.displayIdentifier,
        restaurantId: id,
        productType: input.productType,
        placement: input.placement,
        destination,
        assignmentStatus: input.assignmentStatus,
        operationalStatus: input.operationalStatus,
        artworkStatus: input.artworkStatus,
      };
      demoStore.nfc.create(created);
      recordAudit("nfc.create", newId, `Created NFC ${input.displayIdentifier}`);
      toast({ title: "NFC product created", description: "Saved as a draft entry. No chip was programmed.", intent: "success" });
    } else if (editor.record) {
      demoStore.nfc.update(editor.record.id, {
        displayIdentifier: input.displayIdentifier,
        productType: input.productType,
        placement: input.placement,
        destination,
        assignmentStatus: input.assignmentStatus,
        operationalStatus: input.operationalStatus,
        artworkStatus: input.artworkStatus,
      });
      recordAudit("nfc.update", editor.record.id, `Updated NFC ${input.displayIdentifier}`);
      toast({ title: "NFC product updated", intent: "success" });
    }
    setEditor(null);
  };

  const handleAssign = (record: NFCProduct) => {
    demoStore.nfc.update(record.id, { restaurantId: id, assignmentStatus: "assigned" });
    recordAudit("nfc.assign", record.id, `Assigned NFC ${record.displayIdentifier} to ${restaurant?.displayName ?? id}`);
    toast({ title: "NFC product assigned", description: "Saved as a draft assignment. No chip was reprogrammed.", intent: "success" });
  };

  const handleUnassign = () => {
    if (!unassignTarget) return;
    demoStore.nfc.update(unassignTarget.id, { restaurantId: null, assignmentStatus: "unassigned" });
    recordAudit("nfc.unassign", unassignTarget.id, `Unassigned NFC ${unassignTarget.displayIdentifier}`);
    toast({ title: "NFC product unassigned", intent: "success" });
    setUnassignTarget(null);
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    demoStore.nfc.remove(removeTarget.id);
    recordAudit("nfc.remove", removeTarget.id, `Removed NFC ${removeTarget.displayIdentifier}`);
    toast({ title: "NFC product removed", intent: "success" });
    setRemoveTarget(null);
  };

  const columns = useMemo<ColumnDef<NFCProduct, unknown>[]>(
    () => [
      {
        accessorKey: "displayIdentifier",
        header: "NFC product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-navy text-white">
              <Icon name="Nfc" className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary">{row.original.displayIdentifier}</p>
              <p className="text-xs text-text-secondary">
                {PRODUCT_TYPE_LABELS[row.original.productType]} · {row.original.placement}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "assignmentStatus",
        header: "Assignment",
        cell: ({ row }) => <StatusBadge group="nfc" value={row.original.assignmentStatus} />,
      },
      {
        accessorKey: "operationalStatus",
        header: "Operational",
        cell: ({ row }) => <StatusBadge group="operational" value={row.original.operationalStatus} />,
      },
      {
        accessorKey: "artworkStatus",
        header: "Artwork",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-small text-text-secondary">{ARTWORK_LABELS[row.original.artworkStatus]}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) =>
          canManage ? (
            <div className="flex items-center gap-1">
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
                aria-label={`Unassign ${row.original.displayIdentifier}`}
                onClick={() => setUnassignTarget(row.original)}
              >
                <Icon name="Unlink" className="size-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${row.original.displayIdentifier}`}
                onClick={() => setRemoveTarget(row.original)}
              >
                <Icon name="Trash2" className="size-4" aria-hidden />
              </Button>
            </div>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canManage],
  );

  const filters: FilterConfig[] = [
    {
      id: "assignment",
      label: "Assignment",
      value: assignmentFilter,
      onChange: setAssignmentFilter,
      options: [
        { label: "All", value: "all" },
        ...NFC_ASSIGNMENT_STATUSES.map((s) => ({ label: titleCase(s.replace("-", " ")), value: s })),
      ],
    },
    {
      id: "operational",
      label: "Operational",
      value: operationalFilter,
      onChange: setOperationalFilter,
      options: [
        { label: "All", value: "all" },
        ...OPERATIONAL_STATUSES.map((s) => ({ label: OPERATIONAL_LABELS[s], value: s })),
      ],
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
          { label: "NFC Products" },
        ]}
        actions={
          <PermissionGate user={user} permission={PERMISSIONS.NFC_MANAGE}>
            <Button size="sm" onClick={() => setEditor({ mode: "create", record: null })}>
              <Icon name="Plus" className="size-4" aria-hidden />
              Register product
            </Button>
          </PermissionGate>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="ShieldCheck" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          NFC products link physical chips to public destinations. Add{" "}
          <code className="rounded bg-info/10 px-1">?via=nfc</code> to a destination to attribute taps
          in Analytics. Chip secrets, UIDs and programming keys are never shown here.
        </span>
      </div>

      <section aria-label="NFC summary metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminMetricCard label="Assigned" value={metrics.total} icon="Nfc" />
        <AdminMetricCard label="Active" value={metrics.active} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Reassign pending" value={metrics.reassign} icon="Repeat" intent="warning" />
        <AdminMetricCard label="Unassigned pool" value={metrics.unassigned} icon="Inbox" />
        <AdminMetricCard label="NFC taps (30d)" value={realTaps ?? 0} icon="Activity" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by identifier, type or placement…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {assigned.length === 0 ? (
        <EmptyState
          title="No NFC products assigned"
          description="Register a new product or assign one from the unassigned pool below."
          icon="Nfc"
          action={
            canManage ? { label: "Register product", onClick: () => setEditor({ mode: "create", record: null }) } : undefined
          }
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="Assigned NFC products"
          emptyState={
            <EmptyState
              title="No matches"
              description="No NFC products match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      {unassigned.length > 0 && canManage ? (
        <div className="rounded-[16px] border border-border bg-canvas shadow-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Icon name="Inbox" className="size-4 text-text-secondary" aria-hidden />
            <h2 className="font-display text-h3 text-text-primary">Unassigned pool</h2>
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {unassigned.length}
            </span>
          </div>
          <ul className="divide-y divide-border">
            {unassigned.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-muted text-text-secondary">
                    <Icon name="Nfc" className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary">{n.displayIdentifier}</p>
                    <p className="text-xs text-text-secondary">
                      {PRODUCT_TYPE_LABELS[n.productType]} · {n.placement}
                    </p>
                  </div>
                  <StatusBadge group="nfc" value={n.assignmentStatus} />
                </div>
                <Button variant="outline" size="sm" onClick={() => handleAssign(n)}>
                  <Icon name="Link" className="size-4" aria-hidden />
                  Assign to {restaurant.displayName}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {editor ? (
        <NFCProductEditorDialog
          mode={editor.mode}
          record={editor.record}
          onCancel={() => setEditor(null)}
          onSave={handleSave}
        />
      ) : null}

      <ConfirmationDialog
        open={unassignTarget !== null}
        title="Unassign NFC product?"
        description={`${unassignTarget?.displayIdentifier} will return to the unassigned pool. No chip is reprogrammed.`}
        confirmLabel="Unassign"
        intent="danger"
        icon="Unlink"
        onConfirm={handleUnassign}
        onCancel={() => setUnassignTarget(null)}
      />

      <ConfirmationDialog
        open={removeTarget !== null}
        title="Remove NFC product?"
        description={`${removeTarget?.displayIdentifier} will be removed. This cannot be undone in the demo.`}
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function NFCProductEditorDialog({
  mode,
  record,
  onCancel,
  onSave,
}: {
  mode: "create" | "edit";
  record: NFCProduct | null;
  onCancel: () => void;
  onSave: (input: NFCProductInput) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof nfcProductSchema>, unknown, NFCProductInput>({
    resolver: zodResolver(nfcProductSchema),
    defaultValues: {
      displayIdentifier: record?.displayIdentifier ?? "",
      productType: record?.productType ?? "table-stand",
      placement: record?.placement ?? "",
      destination: record?.destination ?? "",
      assignmentStatus: record?.assignmentStatus ?? "assigned",
      operationalStatus: record?.operationalStatus ?? "active",
      artworkStatus: record?.artworkStatus ?? "not-started",
    },
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nfc-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/40 p-4"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div className="w-full max-w-lg rounded-[20px] border border-border bg-canvas p-6 shadow-lift">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="nfc-editor-title" className="font-display text-h3 text-text-primary">
            {mode === "create" ? "Register NFC product" : "Edit NFC product"}
          </h2>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onCancel}>
            <Icon name="X" className="size-4" aria-hidden />
          </Button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit((input) => onSave(input))}>
          <Field label="Public identifier" htmlFor="nfc-displayIdentifier" error={errors.displayIdentifier?.message} required>
            <Input id="nfc-displayIdentifier" {...register("displayIdentifier")} autoFocus />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product type" htmlFor="nfc-productType" error={errors.productType?.message}>
              <Controller
                control={control}
                name="productType"
                render={({ field }) => (
                  <Select id="nfc-productType" {...field}>
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {PRODUCT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Placement" htmlFor="nfc-placement" error={errors.placement?.message} required>
              <Input id="nfc-placement" placeholder="e.g. Table stand" {...register("placement")} />
            </Field>
          </div>
          <Field
            label="Destination"
            htmlFor="nfc-destination"
            error={errors.destination?.message}
            hint="Optional internal path or approved HTTPS URL. No chip secrets."
          >
            <Input id="nfc-destination" placeholder="/restaurants/pizza-house" {...register("destination")} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Assignment" htmlFor="nfc-assignment" error={errors.assignmentStatus?.message}>
              <Controller
                control={control}
                name="assignmentStatus"
                render={({ field }) => (
                  <Select id="nfc-assignment" {...field}>
                    {NFC_ASSIGNMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {titleCase(s.replace("-", " "))}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Operational" htmlFor="nfc-operational" error={errors.operationalStatus?.message}>
              <Controller
                control={control}
                name="operationalStatus"
                render={({ field }) => (
                  <Select id="nfc-operational" {...field}>
                    {OPERATIONAL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {OPERATIONAL_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </Field>
            <Field label="Artwork" htmlFor="nfc-artwork" error={errors.artworkStatus?.message}>
              <Controller
                control={control}
                name="artworkStatus"
                render={({ field }) => (
                  <Select id="nfc-artwork" {...field}>
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
            <Button type="submit">{mode === "create" ? "Register" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
