"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import { NFC_ASSIGNMENT_STATUSES } from "@/domain/enums";
import type {
  ArtworkStatus,
  NFCAssignmentStatus,
  OperationalStatus,
} from "@/domain/enums";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface NfcRow {
  id: string;
  restaurantId: string | null;
  restaurantName: string;
  displayIdentifier: string;
  productType: string;
  assignmentStatus: NFCAssignmentStatus;
  operationalStatus: OperationalStatus;
  artworkStatus: ArtworkStatus;
}

export default function NfcProductsPage() {
  const [rows, setRows] = useState<NfcRow[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [restaurant, setRestaurant] = useState("all");
  const [assignment, setAssignment] = useState("all");

  const [restaurantOptions, setRestaurantOptions] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(() => {
    try {
      const restaurants = demoStore.listRestaurants();
      const nameById = new Map(restaurants.map((r) => [r.id, r.displayName]));
      const next: NfcRow[] = demoStore.nfc.all().map((n) => ({
        id: n.id,
        restaurantId: n.restaurantId,
        restaurantName:
          n.restaurantId === null
            ? "Unassigned pool"
            : (nameById.get(n.restaurantId) ?? "Unknown restaurant"),
        displayIdentifier: n.displayIdentifier,
        productType: n.productType,
        assignmentStatus: n.assignmentStatus,
        operationalStatus: n.operationalStatus,
        artworkStatus: n.artworkStatus,
      }));
      setRows(next);
      setRestaurantOptions([
        { label: "All restaurants", value: "all" },
        { label: "Unassigned pool", value: "unassigned" },
        ...restaurants.map((r) => ({ label: r.displayName, value: r.id })),
      ]);
      setReady(true);
      setFailed(false);
    } catch {
      setFailed(true);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (restaurant === "unassigned") {
        if (r.restaurantId !== null) return false;
      } else if (restaurant !== "all" && r.restaurantId !== restaurant) {
        return false;
      }
      if (assignment !== "all" && r.assignmentStatus !== assignment) return false;
      if (q) {
        const hay = `${r.displayIdentifier} ${r.productType} ${r.restaurantName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, restaurant, assignment]);

  const hasActiveFilters = search !== "" || restaurant !== "all" || assignment !== "all";
  const resetFilters = () => {
    setSearch("");
    setRestaurant("all");
    setAssignment("all");
  };

  const total = rows.length;
  const assigned = rows.filter((r) => r.assignmentStatus === "assigned").length;
  const unassigned = rows.filter((r) => r.assignmentStatus === "unassigned").length;
  const reassignPending = rows.filter((r) => r.assignmentStatus === "reassign-pending").length;

  const filters: FilterConfig[] = [
    {
      id: "restaurant",
      label: "Restaurant",
      value: restaurant,
      onChange: setRestaurant,
      options: restaurantOptions,
    },
    {
      id: "assignment",
      label: "Assignment",
      value: assignment,
      onChange: setAssignment,
      options: [
        { label: "All", value: "all" },
        ...NFC_ASSIGNMENT_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<NfcRow, unknown>[]>(
    () => [
      {
        accessorKey: "displayIdentifier",
        header: "Identifier",
        cell: ({ row }) => <span className="text-text-primary">{row.original.displayIdentifier}</span>,
      },
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) =>
          row.original.restaurantId === null ? (
            <span className="text-text-tertiary">Unassigned pool</span>
          ) : (
            <Link
              href={routes.admin.restaurantNfc(row.original.restaurantId)}
              className="font-semibold text-text-primary hover:text-primary"
            >
              {row.original.restaurantName}
            </Link>
          ),
      },
      {
        accessorKey: "productType",
        header: "Type",
        cell: ({ row }) => <span className="text-text-secondary">{titleCase(row.original.productType)}</span>,
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
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {titleCase(row.original.artworkStatus)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) =>
          row.original.restaurantId === null ? (
            <span
              className="inline-flex items-center gap-1 text-xs text-text-tertiary"
              title="Assign this tag to a restaurant to manage it"
            >
              <Icon name="Nfc" className="size-3.5" aria-hidden />
              Assign to manage
            </span>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              aria-label={`Manage NFC ${row.original.displayIdentifier}`}
            >
              <Link href={routes.admin.restaurantNfc(row.original.restaurantId)}>
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                Manage
              </Link>
            </Button>
          ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="NFC Products"
        description="Every NFC tag across all restaurants, including the unassigned inventory pool. Open an assigned tag to manage it in its restaurant."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "NFC Products" }]}
      />

      <section aria-label="NFC summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total tags" value={total} icon="Nfc" />
        <AdminMetricCard label="Assigned" value={assigned} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Unassigned" value={unassigned} icon="Inbox" />
        <AdminMetricCard label="Reassign pending" value={reassignPending} icon="Repeat" intent="warning" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by identifier, type or restaurant…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading NFC products…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load NFC products"
          description="The cross-restaurant NFC list failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No NFC products yet"
          description="NFC tags in any restaurant or the unassigned pool will appear here."
          icon="Nfc"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="All NFC products across restaurants"
          emptyState={
            <EmptyState
              title="No matching NFC products"
              description="No NFC tags match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
