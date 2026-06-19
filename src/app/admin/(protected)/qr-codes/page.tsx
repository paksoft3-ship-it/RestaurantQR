"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import { QR_STATUSES } from "@/domain/enums";
import type { ArtworkStatus, QRStatus } from "@/domain/enums";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface QrRow {
  id: string;
  restaurantId: string;
  restaurantName: string;
  displayIdentifier: string;
  placement: string;
  destination: string;
  status: QRStatus;
  artworkStatus: ArtworkStatus;
}

export default function QrCodesPage() {
  const [rows, setRows] = useState<QrRow[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [restaurant, setRestaurant] = useState("all");
  const [status, setStatus] = useState("all");

  const [restaurantOptions, setRestaurantOptions] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(() => {
    try {
      const restaurants = demoStore.listRestaurants();
      const nameById = new Map(restaurants.map((r) => [r.id, r.displayName]));
      const next: QrRow[] = demoStore.qr.all().map((q) => ({
        id: q.id,
        restaurantId: q.restaurantId,
        restaurantName: nameById.get(q.restaurantId) ?? "Unknown restaurant",
        displayIdentifier: q.displayIdentifier,
        placement: q.placement,
        destination: q.destination,
        status: q.status,
        artworkStatus: q.artworkStatus,
      }));
      setRows(next);
      setRestaurantOptions([
        { label: "All restaurants", value: "all" },
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
      if (restaurant !== "all" && r.restaurantId !== restaurant) return false;
      if (status !== "all" && r.status !== status) return false;
      if (q) {
        const hay =
          `${r.displayIdentifier} ${r.placement} ${r.destination} ${r.restaurantName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, restaurant, status]);

  const hasActiveFilters = search !== "" || restaurant !== "all" || status !== "all";
  const resetFilters = () => {
    setSearch("");
    setRestaurant("all");
    setStatus("all");
  };

  const total = rows.length;
  const active = rows.filter((r) => r.status === "active").length;
  const draft = rows.filter((r) => r.status === "draft").length;
  const retired = rows.filter((r) => r.status === "retired").length;

  const filters: FilterConfig[] = [
    {
      id: "restaurant",
      label: "Restaurant",
      value: restaurant,
      onChange: setRestaurant,
      options: restaurantOptions,
    },
    {
      id: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { label: "All", value: "all" },
        ...QR_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<QrRow, unknown>[]>(
    () => [
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) => (
          <Link
            href={routes.admin.restaurantQr(row.original.restaurantId)}
            className="font-semibold text-text-primary hover:text-primary"
          >
            {row.original.restaurantName}
          </Link>
        ),
      },
      {
        accessorKey: "displayIdentifier",
        header: "Identifier",
        cell: ({ row }) => <span className="text-text-primary">{row.original.displayIdentifier}</span>,
      },
      {
        accessorKey: "placement",
        header: "Placement",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.placement}</span>,
      },
      {
        accessorKey: "destination",
        header: "Destination",
        cell: ({ row }) => (
          <span
            className="block max-w-[260px] truncate text-text-secondary"
            title={row.original.destination}
          >
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {titleCase(row.original.artworkStatus)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <Button
            asChild
            variant="ghost"
            size="sm"
            aria-label={`Manage QR ${row.original.displayIdentifier}`}
          >
            <Link href={routes.admin.restaurantQr(row.original.restaurantId)}>
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
        title="QR Codes"
        description="Every QR code across all managed restaurants, with status and artwork progress. Open a row to manage it in its restaurant."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "QR Codes" }]}
      />

      <section aria-label="QR summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total QR codes" value={total} icon="QrCode" />
        <AdminMetricCard label="Active" value={active} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Draft" value={draft} icon="FileEdit" intent="warning" />
        <AdminMetricCard label="Retired" value={retired} icon="Archive" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by identifier, placement or destination…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading QR codes…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load QR codes"
          description="The cross-restaurant QR list failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No QR codes yet"
          description="QR codes created in any restaurant will appear here."
          icon="QrCode"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="All QR codes across restaurants"
          emptyState={
            <EmptyState
              title="No matching QR codes"
              description="No QR codes match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
