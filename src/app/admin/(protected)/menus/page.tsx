"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatPrice, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { AVAILABILITY_STATUSES } from "@/domain/enums";
import type { AvailabilityStatus } from "@/domain/enums";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";

interface MenuRow {
  id: string;
  restaurantId: string;
  restaurantName: string;
  categoryName: string;
  productName: string;
  price: number;
  currency: string;
  availability: AvailabilityStatus;
  featured: boolean;
}

export default function MenusPage() {
  const [rows, setRows] = useState<MenuRow[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [restaurant, setRestaurant] = useState("all");
  const [availability, setAvailability] = useState("all");

  const [restaurantOptions, setRestaurantOptions] = useState<{ label: string; value: string }[]>([]);

  const load = useCallback(() => {
    try {
      const restaurants = demoStore.listRestaurants();
      const nameById = new Map(restaurants.map((r) => [r.id, r.displayName]));
      const products = demoStore.products.all();
      const next: MenuRow[] = products.map((p) => {
        const category = demoStore.categories.byId(p.categoryId);
        return {
          id: p.id,
          restaurantId: p.restaurantId,
          restaurantName: nameById.get(p.restaurantId) ?? "Unknown restaurant",
          categoryName: category ? resolveText(category.localizedName, "en") : "—",
          productName: resolveText(p.localizedName, "en"),
          price: p.price,
          currency: p.currency,
          availability: p.availability,
          featured: p.featured,
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
      if (availability !== "all" && r.availability !== availability) return false;
      if (q) {
        const hay = `${r.productName} ${r.categoryName} ${r.restaurantName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, restaurant, availability]);

  const hasActiveFilters = search !== "" || restaurant !== "all" || availability !== "all";
  const resetFilters = () => {
    setSearch("");
    setRestaurant("all");
    setAvailability("all");
  };

  const total = rows.length;
  const available = rows.filter((r) => r.availability === "available").length;
  const limitedOrOut = rows.filter(
    (r) => r.availability === "limited" || r.availability === "out-of-stock",
  ).length;
  const featured = rows.filter((r) => r.featured).length;

  const filters: FilterConfig[] = [
    {
      id: "restaurant",
      label: "Restaurant",
      value: restaurant,
      onChange: setRestaurant,
      options: restaurantOptions,
    },
    {
      id: "availability",
      label: "Availability",
      value: availability,
      onChange: setAvailability,
      options: [
        { label: "All", value: "all" },
        ...AVAILABILITY_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<MenuRow, unknown>[]>(
    () => [
      {
        accessorKey: "restaurantName",
        header: "Restaurant",
        cell: ({ row }) => (
          <Link
            href={routes.admin.restaurantMenu(row.original.restaurantId)}
            className="font-semibold text-text-primary hover:text-primary"
          >
            {row.original.restaurantName}
          </Link>
        ),
      },
      {
        accessorKey: "categoryName",
        header: "Category",
        cell: ({ row }) => <span className="text-text-secondary">{row.original.categoryName}</span>,
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => <span className="text-text-primary">{row.original.productName}</span>,
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-primary">
            {formatPrice(row.original.price, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "availability",
        header: "Availability",
        cell: ({ row }) => <StatusBadge group="availability" value={row.original.availability} />,
      },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) =>
          row.original.featured ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Icon name="Star" className="size-3.5" aria-hidden />
              Featured
            </span>
          ) : (
            <span className="text-xs text-text-tertiary">—</span>
          ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild variant="ghost" size="sm" aria-label={`Edit ${row.original.productName}`}>
            <Link href={routes.admin.restaurantProduct(row.original.restaurantId, row.original.id)}>
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
        title="Menus"
        description="Every menu product across all managed restaurants. Open a row to edit it in its restaurant's menu editor."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Menus" }]}
      />

      <section aria-label="Menu summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total products" value={total} icon="BookOpen" />
        <AdminMetricCard label="Available" value={available} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Limited / out of stock" value={limitedOrOut} icon="AlertTriangle" intent="warning" />
        <AdminMetricCard label="Featured" value={featured} icon="Star" intent="primary" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, category or restaurant…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading menu products…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load menu products"
          description="The cross-restaurant menu list failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No menu products yet"
          description="Products added in any restaurant's menu editor will appear here."
          icon="BookOpen"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="All menu products across restaurants"
          emptyState={
            <EmptyState
              title="No matching products"
              description="No menu products match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
