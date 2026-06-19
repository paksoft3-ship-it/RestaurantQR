import Link from "next/link";
import { AdminBreadcrumb, type Crumb } from "@/components/admin/admin-breadcrumb";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import type { Restaurant } from "@/domain/entities";

interface RestaurantContextHeaderProps {
  restaurant: Restaurant;
  breadcrumb?: Crumb[];
  actions?: React.ReactNode;
}

/** Identity header for a single restaurant workspace. */
export function RestaurantContextHeader({
  restaurant,
  breadcrumb,
  actions,
}: RestaurantContextHeaderProps) {
  const crumbs: Crumb[] =
    breadcrumb ??
    [
      { label: "Admin", href: routes.admin.dashboard() },
      { label: "Restaurants", href: routes.admin.restaurants() },
      { label: restaurant.displayName },
    ];

  return (
    <div className="flex flex-col gap-4">
      <AdminBreadcrumb items={crumbs} />
      <div className="flex flex-col gap-4 rounded-[16px] border border-border bg-canvas p-5 shadow-card md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-navy text-white">
            <Icon name="Store" className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-h2 text-text-primary">{restaurant.displayName}</h1>
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
                {restaurant.internalId}
              </span>
            </div>
            <p className="mt-0.5 text-small text-text-secondary">
              {titleCase(restaurant.visualDirection)} ·{" "}
              {restaurant.restaurantTypes.map(titleCase).join(", ")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge group="publishing" value={restaurant.publishingStatus} />
              <StatusBadge group="restaurantSetup" value={restaurant.setupStatus} />
              <StatusBadge group="operational" value={restaurant.operationalStatus} />
              <StatusBadge group="project" value={restaurant.projectStatus} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {restaurant.publishingStatus === "published" ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={routes.restaurant.home(restaurant.slug)}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                Public preview
              </Link>
            </Button>
          ) : null}
          {actions}
        </div>
      </div>
    </div>
  );
}
