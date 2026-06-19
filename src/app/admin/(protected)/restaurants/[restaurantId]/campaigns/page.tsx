"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { CAMPAIGN_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import type { Campaign, Restaurant } from "@/domain/entities";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const REWARD_TYPE_LABELS: Record<Campaign["reward"]["type"], string> = {
  discount: "Discount",
  "free-item": "Free item",
  points: "Points",
  voucher: "Voucher",
};

type StatusActionKind = "archive" | "end";

export default function RestaurantCampaignsPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const router = useRouter();
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ready, setReady] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [removeTarget, setRemoveTarget] = useState<Campaign | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ campaign: Campaign; kind: StatusActionKind } | null>(null);

  const canEdit = !!user && (user.permissions.length === 0 || user.permissions.includes(PERMISSIONS.CAMPAIGN_EDIT));

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setCampaigns(demoStore.campaigns.where((c) => c.restaurantId === id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (q) {
        const hay = `${resolveText(c.localizedTitle)} ${c.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      return true;
    });
  }, [campaigns, search, statusFilter]);

  const metrics = useMemo(
    () => ({
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active").length,
      scheduled: campaigns.filter((c) => c.status === "scheduled").length,
      draft: campaigns.filter((c) => c.status === "draft").length,
    }),
    [campaigns],
  );

  const hasActiveFilters = search !== "" || statusFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const recordAudit = (action: string, resourceId: string, description: string) => {
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "campaign-manager",
      action,
      resourceType: "campaign",
      resourceId,
      description,
    });
  };

  const handleStatusChange = () => {
    if (!statusTarget) return;
    const next = statusTarget.kind === "archive" ? "archived" : "ended";
    demoStore.campaigns.update(statusTarget.campaign.id, { status: next });
    recordAudit(
      `campaign.${statusTarget.kind === "archive" ? "archive" : "end"}`,
      statusTarget.campaign.id,
      `${statusTarget.kind === "archive" ? "Archived" : "Ended"} campaign ${resolveText(statusTarget.campaign.localizedTitle)}`,
    );
    toast({
      title: statusTarget.kind === "archive" ? "Campaign archived" : "Campaign ended",
      description: "Publishing status is unchanged.",
      intent: "success",
    });
    setStatusTarget(null);
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    demoStore.campaigns.remove(removeTarget.id);
    recordAudit("campaign.remove", removeTarget.id, `Removed campaign ${resolveText(removeTarget.localizedTitle)}`);
    toast({ title: "Campaign removed", intent: "success" });
    setRemoveTarget(null);
  };

  const columns = useMemo<ColumnDef<Campaign, unknown>[]>(
    () => [
      {
        accessorKey: "localizedTitle",
        header: "Campaign",
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={routes.admin.restaurantCampaign(id, row.original.id)}
              className="font-semibold text-text-primary hover:text-primary"
            >
              {resolveText(row.original.localizedTitle)}
            </Link>
            <p className="text-xs text-text-secondary">/{row.original.slug}</p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="campaign" value={row.original.status} />,
      },
      {
        id: "schedule",
        header: "Schedule",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-small text-text-secondary">
            {row.original.startDate ? formatDate(row.original.startDate) : "—"}
            {" – "}
            {row.original.endDate ? formatDate(row.original.endDate) : "—"}
          </span>
        ),
      },
      {
        id: "reward",
        header: "Reward",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-small text-text-primary">{resolveText(row.original.reward.title)}</p>
            <p className="text-xs text-text-secondary">{REWARD_TYPE_LABELS[row.original.reward.type]}</p>
          </div>
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
              aria-label={`Edit ${resolveText(row.original.localizedTitle)}`}
            >
              <Link href={routes.admin.restaurantCampaign(id, row.original.id)}>
                <Icon name="Pencil" className="size-4" aria-hidden />
              </Link>
            </Button>
            {canEdit ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`End ${resolveText(row.original.localizedTitle)}`}
                  disabled={row.original.status === "ended" || row.original.status === "archived"}
                  onClick={() => setStatusTarget({ campaign: row.original, kind: "end" })}
                >
                  <Icon name="Flag" className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Archive ${resolveText(row.original.localizedTitle)}`}
                  disabled={row.original.status === "archived"}
                  onClick={() => setStatusTarget({ campaign: row.original, kind: "archive" })}
                >
                  <Icon name="Archive" className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${resolveText(row.original.localizedTitle)}`}
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
    [id, canEdit],
  );

  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [{ label: "All", value: "all" }, ...CAMPAIGN_STATUSES.map((s) => ({ label: titleCase(s), value: s }))],
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
          { label: "Campaigns" },
        ]}
        actions={
          <PermissionGate user={user} permission={PERMISSIONS.CAMPAIGN_EDIT}>
            <Button asChild size="sm">
              <Link href={routes.admin.restaurantCampaign(id, "new")}>
                <Icon name="Plus" className="size-4" aria-hidden />
                Add campaign
              </Link>
            </Button>
          </PermissionGate>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Campaigns are simple thank-you mechanics — no paid entry, gambling or automatic winner selection. Participant
          counts shown elsewhere are illustrative demo data. Publishing is a separate, explicit step.
        </span>
      </div>

      <section aria-label="Campaign summary metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total" value={metrics.total} icon="Megaphone" />
        <AdminMetricCard label="Active" value={metrics.active} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Scheduled" value={metrics.scheduled} icon="CalendarClock" />
        <AdminMetricCard label="Draft" value={metrics.draft} icon="FileEdit" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by title or slug…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Create the first campaign to offer a simple reward through QR/NFC entry points."
          icon="Megaphone"
          action={canEdit ? { label: "Add campaign", onClick: () => router.push(routes.admin.restaurantCampaign(id, "new")) } : undefined}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(c) => c.id}
          caption="Restaurant campaigns"
          emptyState={
            <EmptyState
              title="No matches"
              description="No campaigns match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      <ConfirmationDialog
        open={statusTarget !== null}
        title={statusTarget?.kind === "archive" ? "Archive campaign?" : "End campaign?"}
        description={
          statusTarget?.kind === "archive"
            ? `${statusTarget ? resolveText(statusTarget.campaign.localizedTitle) : ""} will be archived. Reversible; data is kept.`
            : `${statusTarget ? resolveText(statusTarget.campaign.localizedTitle) : ""} will be marked ended. Publishing status is unchanged.`
        }
        confirmLabel={statusTarget?.kind === "archive" ? "Archive" : "End"}
        intent="danger"
        icon={statusTarget?.kind === "archive" ? "Archive" : "Flag"}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusTarget(null)}
      />

      <ConfirmationDialog
        open={removeTarget !== null}
        title="Remove campaign?"
        description={`${removeTarget ? resolveText(removeTarget.localizedTitle) : ""} will be removed. This cannot be undone in the demo.`}
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
