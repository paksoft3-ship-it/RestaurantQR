"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { InteractionAnalyticsChart } from "@/components/charts/interaction-analytics-chart";
import { WidgetBoundary } from "@/components/shared/error-boundary";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";

interface AnalyticsRow {
  id: string;
  restaurantId: string;
  restaurantName: string;
  scans: number;
  taps: number;
  menuViews: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

/** Deterministic non-negative hash so demo figures are stable across renders. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const DemoTag = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
    <Icon name="FlaskConical" className="size-3" aria-hidden />
    Illustrative Demo Data
  </span>
);

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [restaurant, setRestaurant] = useState("all");
  const [restaurantOptions, setRestaurantOptions] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(() => {
    try {
      const restaurants = demoStore.listRestaurants();
      const qrCount = demoStore.qr.all().length;
      const nfcCount = demoStore.nfc.all().length;
      const productCount = demoStore.products.all().length;

      const next: AnalyticsRow[] = restaurants.map((r) => {
        const seed = hash(r.id);
        // Deterministic, clearly synthetic figures derived from id + inventory counts.
        return {
          id: r.id,
          restaurantId: r.id,
          restaurantName: r.displayName,
          scans: 120 + (seed % 880) + qrCount * 7,
          taps: 60 + (seed % 540) + nfcCount * 5,
          menuViews: 200 + (seed % 1500) + productCount * 11,
        };
      });
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
      if (q && !r.restaurantName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, restaurant]);

  const hasActiveFilters = search !== "" || restaurant !== "all";
  const resetFilters = () => {
    setSearch("");
    setRestaurant("all");
  };

  const totals = useMemo(() => {
    const scans = filtered.reduce((sum, r) => sum + r.scans, 0);
    const taps = filtered.reduce((sum, r) => sum + r.taps, 0);
    const menuViews = filtered.reduce((sum, r) => sum + r.menuViews, 0);
    // Action clicks: deterministic share of menu views.
    const actionClicks = Math.round(menuViews * 0.18);
    return { scans, taps, menuViews, actionClicks };
  }, [filtered]);

  // Deterministic monthly series from the current totals.
  const series = useMemo(() => {
    const base = totals.scans + totals.taps + totals.menuViews;
    const weights = [0.12, 0.14, 0.17, 0.16, 0.2, 0.21];
    return MONTHS.map((label, i) => ({
      label,
      value: Math.round(base * weights[i]),
    }));
  }, [totals]);

  const filters: FilterConfig[] = [
    {
      id: "restaurant",
      label: "Restaurant",
      value: restaurant,
      onChange: setRestaurant,
      options: restaurantOptions,
    },
  ];

  const columns = useMemo<ColumnDef<AnalyticsRow, unknown>[]>(
    () => [
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) => (
          <Link
            href={routes.admin.restaurantAnalytics(row.original.restaurantId)}
            className="font-semibold text-text-primary hover:text-primary"
          >
            {row.original.restaurantName}
          </Link>
        ),
      },
      {
        accessorKey: "scans",
        header: "Scans",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-primary">{row.original.scans.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "taps",
        header: "Taps",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-primary">{row.original.taps.toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "menuViews",
        header: "Menu views",
        cell: ({ row }) => (
          <span className="tabular-nums text-text-primary">{row.original.menuViews.toLocaleString()}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Analytics"
        description="Platform-wide interaction overview across all restaurants. Open a restaurant to see its own analytics."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Analytics" }]}
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-warning/30 bg-warning/5 p-4">
        <Icon name="FlaskConical" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <p className="text-small text-text-secondary">
          Every figure on this page is <strong>illustrative demo data</strong>, derived
          deterministically from the demo content. No real tracking is performed and no analytics
          service is queried.
        </p>
      </div>

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading analytics…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load analytics"
          description="The platform analytics overview failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No restaurants yet"
          description="Add restaurants to see illustrative platform analytics."
          icon="ChartColumn"
        />
      ) : (
        <>
          <AdminFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search restaurants…"
            filters={filters}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <section aria-label="Platform totals" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminMetricCard label="Total scans" value={totals.scans.toLocaleString()} icon="QrCode" demo />
            <AdminMetricCard label="Total taps" value={totals.taps.toLocaleString()} icon="Nfc" demo />
            <AdminMetricCard
              label="Menu views"
              value={totals.menuViews.toLocaleString()}
              icon="BookOpen"
              demo
            />
            <AdminMetricCard
              label="Action clicks"
              value={totals.actionClicks.toLocaleString()}
              icon="MousePointerClick"
              demo
            />
          </section>

          <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-h3 text-text-primary">Interaction volume</h2>
              <DemoTag />
            </div>
            <WidgetBoundary label="the analytics chart">
              <InteractionAnalyticsChart series={series} title="Interaction volume" />
            </WidgetBoundary>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-h3 text-text-primary">Per-restaurant breakdown</h2>
              <DemoTag />
            </div>
            <AdminDataTable
              columns={columns}
              data={filtered}
              getRowId={(r) => r.id}
              caption="Illustrative per-restaurant interaction figures"
              emptyState={
                <EmptyState
                  title="No matching restaurants"
                  description="No restaurants match your search and filters."
                  icon="Search"
                  action={
                    hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined
                  }
                />
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
