"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import {
  operationalStatusOptions,
  setupStatusOptions,
  visualDirectionOptions,
} from "@/components/admin/restaurant-form-options";
import { PUBLISHING_STATUSES } from "@/domain/enums";
import type { Restaurant } from "@/domain/entities";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

type ConfirmKind = "archive" | "disable";

interface ConfirmTarget {
  kind: ConfirmKind;
  restaurant: Restaurant;
}

export default function RestaurantsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ready, setReady] = useState(false);

  // URL-synced search & filters.
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [operational, setOperational] = useState(searchParams.get("op") ?? "all");
  const [publishing, setPublishing] = useState(searchParams.get("pub") ?? "all");
  const [setup, setSetup] = useState(searchParams.get("setup") ?? "all");
  const [visual, setVisual] = useState(searchParams.get("visual") ?? "all");
  const [showArchived, setShowArchived] = useState(searchParams.get("archived") === "1");

  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null);

  const load = useCallback(() => {
    setRestaurants(demoStore.listRestaurants());
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  // Sync URL (replace, no scroll) when filters change.
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (operational !== "all") params.set("op", operational);
    if (publishing !== "all") params.set("pub", publishing);
    if (setup !== "all") params.set("setup", setup);
    if (visual !== "all") params.set("visual", visual);
    if (showArchived) params.set("archived", "1");
    const qs = params.toString();
    router.replace(qs ? `${routes.admin.restaurants()}?${qs}` : routes.admin.restaurants(), {
      scroll: false,
    });
  }, [search, operational, publishing, setup, visual, showArchived, router]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (!showArchived && r.publishingStatus === "archived") return false;
      if (q) {
        const hay = `${r.name} ${r.displayName} ${r.internalId} ${r.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (operational !== "all" && r.operationalStatus !== operational) return false;
      if (publishing !== "all" && r.publishingStatus !== publishing) return false;
      if (setup !== "all" && r.setupStatus !== setup) return false;
      if (visual !== "all" && r.visualDirection !== visual) return false;
      return true;
    });
  }, [restaurants, search, operational, publishing, setup, visual, showArchived]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  );

  const visibleRestaurants = restaurants.filter((r) => r.publishingStatus !== "archived");
  const archivedCount = restaurants.length - visibleRestaurants.length;

  const resetFilters = () => {
    setSearch("");
    setOperational("all");
    setPublishing("all");
    setSetup("all");
    setVisual("all");
    setShowArchived(false);
  };

  const hasActiveFilters =
    search !== "" ||
    operational !== "all" ||
    publishing !== "all" ||
    setup !== "all" ||
    visual !== "all" ||
    showArchived;

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((r) => selected[r.id]);

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      filtered.forEach((r) => (next[r.id] = true));
      setSelected(next);
    }
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const patch =
      confirm.kind === "archive"
        ? { publishingStatus: "archived" as const }
        : { operationalStatus: "disabled" as const };
    demoStore.updateRestaurant(confirm.restaurant.id, patch);
    toast({
      title: confirm.kind === "archive" ? "Restaurant archived" : "Restaurant disabled",
      description: `${confirm.restaurant.displayName} updated. Nothing was published.`,
      intent: "success",
    });
    setConfirm(null);
  };

  const columns = useMemo<ColumnDef<Restaurant, unknown>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: () => (
          <Checkbox
            checked={allVisibleSelected}
            onChange={toggleAll}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={!!selected[row.original.id]}
            onChange={(e) =>
              setSelected((prev) => ({ ...prev, [row.original.id]: e.target.checked }))
            }
            aria-label={`Select ${row.original.displayName}`}
          />
        ),
      },
      {
        accessorKey: "displayName",
        header: "Restaurant",
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={routes.admin.restaurant(row.original.id)}
              className="font-semibold text-text-primary hover:text-primary"
            >
              {row.original.displayName}
            </Link>
            <p className="text-xs text-text-secondary">{titleCase(row.original.visualDirection)}</p>
          </div>
        ),
      },
      { accessorKey: "internalId", header: "Internal ID" },
      {
        accessorKey: "setupStatus",
        header: "Setup",
        cell: ({ row }) => <StatusBadge group="restaurantSetup" value={row.original.setupStatus} />,
      },
      {
        accessorKey: "publishingStatus",
        header: "Publishing",
        cell: ({ row }) => <StatusBadge group="publishing" value={row.original.publishingStatus} />,
      },
      {
        id: "teams",
        enableSorting: false,
        header: "Teams",
        cell: ({ row }) =>
          row.original.assignedTeams.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.assignedTeams.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-text-tertiary">Unassigned</span>
          ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label={`Open ${row.original.displayName}`}>
              <Link href={routes.admin.restaurant(row.original.id)}>
                <Icon name="ArrowUpRight" className="size-4" aria-hidden />
              </Link>
            </Button>
            {row.original.publishingStatus === "published" ? (
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label={`Public preview of ${row.original.displayName}`}
              >
                <Link href={routes.restaurant.home(row.original.slug)} target="_blank" rel="noreferrer">
                  <Icon name="ExternalLink" className="size-4" aria-hidden />
                </Link>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Disable ${row.original.displayName}`}
              disabled={row.original.operationalStatus === "disabled"}
              onClick={() => setConfirm({ kind: "disable", restaurant: row.original })}
            >
              <Icon name="Ban" className="size-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Archive ${row.original.displayName}`}
              disabled={row.original.publishingStatus === "archived"}
              onClick={() => setConfirm({ kind: "archive", restaurant: row.original })}
            >
              <Icon name="Archive" className="size-4" aria-hidden />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, allVisibleSelected],
  );

  const filters: FilterConfig[] = [
    {
      id: "operational",
      label: "Operational",
      value: operational,
      onChange: setOperational,
      options: [{ label: "All", value: "all" }, ...operationalStatusOptions],
    },
    {
      id: "publishing",
      label: "Publishing",
      value: publishing,
      onChange: setPublishing,
      options: [
        { label: "All", value: "all" },
        ...PUBLISHING_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
    {
      id: "setup",
      label: "Setup",
      value: setup,
      onChange: setSetup,
      options: [{ label: "All", value: "all" }, ...setupStatusOptions],
    },
    {
      id: "visual",
      label: "Visual direction",
      value: visual,
      onChange: setVisual,
      options: [{ label: "All", value: "all" }, ...visualDirectionOptions],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Restaurants"
        description="Every restaurant YourPlatform manages. Open one to work on its setup, branding and content."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Restaurants" }]}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  title: "Export started (demo)",
                  description: "A CSV export would download here in production.",
                  intent: "info",
                })
              }
            >
              <Icon name="Download" className="size-4" aria-hidden />
              Export
            </Button>
            <Button asChild>
              <Link href={routes.admin.restaurantNew()}>
                <Icon name="Plus" className="size-4" aria-hidden />
                Add Restaurant
              </Link>
            </Button>
          </>
        }
      />

      <section
        aria-label="Summary metrics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <AdminMetricCard label="Total" value={visibleRestaurants.length} icon="Store" />
        <AdminMetricCard
          label="Published"
          value={visibleRestaurants.filter((r) => r.publishingStatus === "published").length}
          icon="Globe"
          intent="success"
        />
        <AdminMetricCard
          label="In review"
          value={
            visibleRestaurants.filter(
              (r) => r.publishingStatus === "in-review" || r.publishingStatus === "changes-pending",
            ).length
          }
          icon="Eye"
          intent="warning"
        />
        <AdminMetricCard label="Archived" value={archivedCount} icon="Archive" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, internal ID or slug…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      >
        <label className="mb-0.5 flex min-w-[160px] cursor-pointer items-center gap-2 text-small text-text-secondary">
          <Checkbox
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
      </AdminFilterBar>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-primary/30 bg-primary/5 p-3">
          <p className="text-small font-medium text-text-primary">
            {selectedIds.length} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                toast({
                  title: "Bulk action queued (demo)",
                  description: `${selectedIds.length} restaurants would be updated.`,
                  intent: "info",
                });
                setSelected({});
              }}
            >
              <Icon name="ListChecks" className="size-4" aria-hidden />
              Bulk action
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected({})}>
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading restaurants…
        </div>
      ) : visibleRestaurants.length === 0 && archivedCount === 0 ? (
        <EmptyState
          title="No restaurants yet"
          description="Add your first managed restaurant to get started."
          icon="Store"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          sorting={sorting}
          onSortingChange={setSorting}
          getRowId={(r) => r.id}
          caption="Managed restaurants"
          emptyState={
            <EmptyState
              title={hasActiveFilters ? "No matches" : "Nothing to show"}
              description={
                hasActiveFilters
                  ? "No restaurants match your search and filters."
                  : showArchived
                    ? "No archived restaurants."
                    : "All restaurants are archived. Enable “Show archived”."
              }
              icon="Search"
              action={
                hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined
              }
            />
          }
        />
      )}

      <ConfirmationDialog
        open={confirm !== null}
        title={confirm?.kind === "archive" ? "Archive restaurant?" : "Disable restaurant?"}
        description={
          confirm?.kind === "archive"
            ? `${confirm?.restaurant.displayName} will be hidden from active lists. This does not delete data and can be reversed.`
            : `${confirm?.restaurant.displayName} will be marked disabled. Public visibility is unaffected until you publish changes.`
        }
        confirmLabel={confirm?.kind === "archive" ? "Archive" : "Disable"}
        intent="danger"
        icon={confirm?.kind === "archive" ? "Archive" : "Ban"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
