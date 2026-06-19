"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import { MEDIA_TYPES } from "@/domain/enums";
import type { AssetStatus, MediaType, RightsStatus } from "@/domain/enums";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface MediaRow {
  id: string;
  restaurantId: string | null;
  restaurantName: string;
  type: MediaType;
  filename: string;
  publicUrl: string;
  altText: string | null;
  rightsStatus: RightsStatus;
  status: AssetStatus;
}

function MediaThumb({ row }: { row: MediaRow }) {
  const [src, setSrc] = useState(row.publicUrl || `/placeholders/${row.type}.svg`);
  return (
    <span className="relative block size-12 shrink-0 overflow-hidden rounded-[8px] border border-border bg-surface">
      <Image
        src={src}
        alt={row.altText ?? row.filename}
        width={48}
        height={48}
        className="size-12 object-cover"
        onError={() => setSrc(`/placeholders/${row.type}.svg`)}
        unoptimized
      />
    </span>
  );
}

export default function MediaPage() {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [restaurant, setRestaurant] = useState("all");
  const [type, setType] = useState("all");

  const [restaurantOptions, setRestaurantOptions] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(() => {
    try {
      const restaurants = demoStore.listRestaurants();
      const nameById = new Map(restaurants.map((r) => [r.id, r.displayName]));
      const next: MediaRow[] = demoStore.media.all().map((m) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        restaurantName:
          m.restaurantId === null
            ? "Shared / unassigned"
            : (nameById.get(m.restaurantId) ?? "Unknown restaurant"),
        type: m.type,
        filename: m.filename,
        publicUrl: m.publicUrl,
        altText: m.altText,
        rightsStatus: m.rightsStatus,
        status: m.status,
      }));
      setRows(next);
      setRestaurantOptions([
        { label: "All restaurants", value: "all" },
        { label: "Shared / unassigned", value: "unassigned" },
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
      if (type !== "all" && r.type !== type) return false;
      if (q) {
        const hay = `${r.filename} ${r.restaurantName} ${r.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, restaurant, type]);

  const hasActiveFilters = search !== "" || restaurant !== "all" || type !== "all";
  const resetFilters = () => {
    setSearch("");
    setRestaurant("all");
    setType("all");
  };

  const total = rows.length;
  const readyCount = rows.filter((r) => r.status === "ready").length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const needsRights = rows.filter((r) => r.rightsStatus === "needs-review").length;

  const filters: FilterConfig[] = [
    {
      id: "restaurant",
      label: "Restaurant",
      value: restaurant,
      onChange: setRestaurant,
      options: restaurantOptions,
    },
    {
      id: "type",
      label: "Type",
      value: type,
      onChange: setType,
      options: [
        { label: "All", value: "all" },
        ...MEDIA_TYPES.map((t) => ({ label: titleCase(t), value: t })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<MediaRow, unknown>[]>(
    () => [
      {
        id: "thumbnail",
        enableSorting: false,
        header: "Preview",
        cell: ({ row }) => <MediaThumb row={row.original} />,
      },
      {
        accessorKey: "filename",
        header: "Filename",
        cell: ({ row }) => <span className="text-text-primary">{row.original.filename}</span>,
      },
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) =>
          row.original.restaurantId === null ? (
            <span className="text-text-tertiary">Shared / unassigned</span>
          ) : (
            <Link
              href={routes.admin.restaurantMedia(row.original.restaurantId)}
              className="font-semibold text-text-primary hover:text-primary"
            >
              {row.original.restaurantName}
            </Link>
          ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <span className="text-text-secondary">{titleCase(row.original.type)}</span>,
      },
      {
        accessorKey: "rightsStatus",
        header: "Rights",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {titleCase(row.original.rightsStatus)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="asset" value={row.original.status} />,
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) =>
          row.original.restaurantId === null ? (
            <span className="text-xs text-text-tertiary">—</span>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              aria-label={`Open media for ${row.original.restaurantName}`}
            >
              <Link href={routes.admin.restaurantMedia(row.original.restaurantId)}>
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                Open
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
        title="Media Library"
        description="Every media asset across all managed restaurants, with rights and processing status."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Media Library" }]}
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          This is a demo library. Any uploads are temporary, stored only in your browser, and are
          not published or shared.
        </p>
      </div>

      <section aria-label="Media summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total assets" value={total} icon="Image" />
        <AdminMetricCard label="Ready" value={readyCount} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Pending" value={pending} icon="Clock" intent="warning" />
        <AdminMetricCard label="Needs rights review" value={needsRights} icon="ShieldAlert" intent="primary" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by filename, type or restaurant…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading media library…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load media"
          description="The cross-restaurant media library failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Assets uploaded in any restaurant will appear here."
          icon="Image"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="All media assets across restaurants"
          emptyState={
            <EmptyState
              title="No matching media"
              description="No assets match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
