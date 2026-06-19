"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { CAMPAIGN_STATUSES } from "@/domain/enums";
import type { CampaignStatus } from "@/domain/enums";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface CampaignRow {
  id: string;
  restaurantId: string;
  restaurantName: string;
  title: string;
  status: CampaignStatus;
  startDate: string | null;
  endDate: string | null;
  reward: string;
}

export default function CampaignsPage() {
  const [rows, setRows] = useState<CampaignRow[]>([]);
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
      const next: CampaignRow[] = demoStore.campaigns.all().map((c) => ({
        id: c.id,
        restaurantId: c.restaurantId,
        restaurantName: nameById.get(c.restaurantId) ?? "Unknown restaurant",
        title: resolveText(c.localizedTitle, "en"),
        status: c.status,
        startDate: c.startDate,
        endDate: c.endDate,
        reward: resolveText(c.reward.title, "en"),
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
        const hay = `${r.title} ${r.reward} ${r.restaurantName}`.toLowerCase();
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
  const scheduled = rows.filter((r) => r.status === "scheduled").length;
  const ended = rows.filter((r) => r.status === "ended").length;

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
        ...CAMPAIGN_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<CampaignRow, unknown>[]>(
    () => [
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) => (
          <Link
            href={routes.admin.restaurantCampaigns(row.original.restaurantId)}
            className="font-semibold text-text-primary hover:text-primary"
          >
            {row.original.restaurantName}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <span className="text-text-primary">{row.original.title}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="campaign" value={row.original.status} />,
      },
      {
        id: "schedule",
        enableSorting: false,
        header: "Schedule",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDate(row.original.startDate)} – {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: "reward",
        header: "Reward",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.reward || "—"}</span>,
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild variant="ghost" size="sm" aria-label={`Edit campaign ${row.original.title}`}>
            <Link href={routes.admin.restaurantCampaign(row.original.restaurantId, row.original.id)}>
              <Icon name="ExternalLink" className="size-4" aria-hidden />
              Edit
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
        title="Campaigns"
        description="Every campaign across all managed restaurants, with schedule and reward. Open a row to edit it in its restaurant."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Campaigns" }]}
      />

      <section aria-label="Campaign summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total campaigns" value={total} icon="Megaphone" />
        <AdminMetricCard label="Active" value={active} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Scheduled" value={scheduled} icon="CalendarClock" intent="primary" />
        <AdminMetricCard label="Ended" value={ended} icon="Flag" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title, reward or restaurant…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading campaigns…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load campaigns"
          description="The cross-restaurant campaign list failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Campaigns created in any restaurant will appear here."
          icon="Megaphone"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="All campaigns across restaurants"
          emptyState={
            <EmptyState
              title="No matching campaigns"
              description="No campaigns match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
