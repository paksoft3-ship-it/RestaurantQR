import Link from "next/link";
import { getCurrentAdminUser } from "@/lib/auth";
import { getRepositories } from "@/data/repositories";
import { routes } from "@/lib/routes";
import { isDemoMode } from "@/lib/config/app-config";
import { titleCase } from "@/lib/utils";
import { PERMISSIONS } from "@/domain/permissions";
import type { ActivityRecord, Enquiry, Restaurant } from "@/domain/entities";
import type { AnalyticsSnapshot } from "@/data/repositories";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/states";
import { InteractionAnalyticsChart } from "@/components/charts/interaction-analytics-chart";

/** Run a widget data fetch and contain failures so one error never blanks the page. */
async function safe<T>(load: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    return { ok: true, data: await load() };
  } catch {
    return { ok: false };
  }
}

function WidgetError({ label }: { label: string }) {
  return (
    <ErrorState
      title={`Couldn't load ${label}`}
      description="This widget failed to load. The rest of the dashboard is unaffected."
    />
  );
}

export default async function AdminDashboardPage() {
  const user = await getCurrentAdminUser();
  const repos = getRepositories();

  const [snapshotR, activityR, enquiriesR, restaurantsR] = await Promise.all([
    safe<AnalyticsSnapshot>(() => repos.analytics.platformSnapshot()),
    safe<ActivityRecord[]>(() => repos.activity.recent(6)),
    safe<Enquiry[]>(() => repos.enquiries.list()),
    safe(() => repos.restaurants.list({ pageSize: 100, includeArchived: true })),
  ]);

  const restaurants: Restaurant[] = restaurantsR.ok ? restaurantsR.data.items : [];

  const published = restaurants.filter((r) => r.publishingStatus === "published").length;
  const inReview = restaurants.filter(
    (r) => r.publishingStatus === "in-review" || r.publishingStatus === "changes-pending",
  );
  const drafts = restaurants.filter((r) => r.publishingStatus === "draft");
  const setupInProgress = restaurants.filter(
    (r) => r.setupStatus !== "ready" && r.setupStatus !== "not-started",
  );
  const needsSetup = restaurants.filter((r) => r.setupStatus === "not-started");
  const newEnquiries = enquiriesR.ok ? enquiriesR.data.filter((e) => e.status === "new") : [];

  const attention: { label: string; href: string; badge: string; icon: string }[] = [];
  inReview.slice(0, 4).forEach((r) =>
    attention.push({
      label: `${r.displayName} is awaiting review`,
      href: routes.admin.restaurant(r.id),
      badge: titleCase(r.publishingStatus),
      icon: "Eye",
    }),
  );
  needsSetup.slice(0, 3).forEach((r) =>
    attention.push({
      label: `${r.displayName} setup not started`,
      href: routes.admin.restaurant(r.id),
      badge: "Setup",
      icon: "ClipboardList",
    }),
  );
  newEnquiries.slice(0, 3).forEach((e) =>
    attention.push({
      label: `New enquiry from ${e.restaurantName}`,
      href: routes.admin.enquiries(),
      badge: "Enquiry",
      icon: "Inbox",
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="A calm operational overview of the restaurants you manage."
        actions={
          <Button asChild>
            <Link href={routes.admin.restaurantNew()}>
              <Icon name="Plus" className="size-4" aria-hidden />
              Add restaurant
            </Link>
          </Button>
        }
      />

      {/* Operational alert banner */}
      {attention.length > 0 ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-warning/30 bg-warning/5 p-4">
          <Icon name="AlertTriangle" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <div className="flex-1">
            <p className="text-small font-semibold text-text-primary">
              {attention.length} {attention.length === 1 ? "item needs" : "items need"} attention
            </p>
            <p className="text-small text-text-secondary">
              Reviews pending, setup tasks and new enquiries are listed below.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-[16px] border border-success/30 bg-success/5 p-4">
          <Icon name="CheckCircle2" className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <p className="text-small text-text-secondary">
            Nothing urgent right now. All managed restaurants are up to date.
          </p>
        </div>
      )}

      {/* Metric cards */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          label="Restaurants managed"
          value={restaurants.length}
          icon="Store"
          hint={`${published} published`}
        />
        <AdminMetricCard
          label="Pending review"
          value={inReview.length}
          icon="Eye"
          intent="warning"
          hint="Publishing workflow"
        />
        <AdminMetricCard
          label="In setup"
          value={setupInProgress.length}
          icon="ClipboardList"
          intent="primary"
        />
        <AdminMetricCard
          label="New enquiries"
          value={enquiriesR.ok ? newEnquiries.length : "—"}
          icon="Inbox"
          intent="success"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Tasks requiring attention */}
          <AdminSection title="Tasks requiring attention" icon="ListChecks">
            {attention.length === 0 ? (
              <p className="text-small text-text-secondary">You are all caught up.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {attention.map((task, i) => (
                  <li key={`${task.href}-${i}`}>
                    <Link
                      href={task.href}
                      className="flex min-h-12 items-center gap-3 py-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
                        <Icon name={task.icon} className="size-4" aria-hidden />
                      </span>
                      <span className="flex-1 text-small text-text-primary">{task.label}</span>
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-text-secondary">
                        {task.badge}
                      </span>
                      <Icon name="ChevronRight" className="size-4 text-text-tertiary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminSection>

          {/* Interaction analytics chart */}
          <PermissionGate user={user} permission={PERMISSIONS.ANALYTICS_VIEW}>
            <AdminSection
              title="Interaction analytics"
              description="Daily interactions across all restaurants (last 14 days)."
              icon="BarChart3"
              actions={
                <Link
                  href={routes.admin.analytics()}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View analytics
                </Link>
              }
            >
              {snapshotR.ok ? (
                <InteractionAnalyticsChart series={snapshotR.data.series} />
              ) : (
                <WidgetError label="analytics" />
              )}
            </AdminSection>
          </PermissionGate>

          {/* Publishing workflow */}
          <AdminSection title="Publishing workflow" icon="GitPullRequest">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Draft", value: drafts.length, group: "publishing" as const, key: "draft" },
                {
                  label: "In review",
                  value: restaurants.filter((r) => r.publishingStatus === "in-review").length,
                  group: "publishing" as const,
                  key: "in-review",
                },
                {
                  label: "Changes pending",
                  value: restaurants.filter((r) => r.publishingStatus === "changes-pending").length,
                  group: "publishing" as const,
                  key: "changes-pending",
                },
                { label: "Published", value: published, group: "publishing" as const, key: "published" },
              ].map((stage) => (
                <div
                  key={stage.key}
                  className="flex flex-col gap-2 rounded-[12px] border border-border bg-surface p-3"
                >
                  <StatusBadge group={stage.group} value={stage.key} />
                  <p className="font-display text-h2 text-text-primary">{stage.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-text-secondary">
              Publishing is always a separate, reviewed step. Admin actions create drafts only.
            </p>
          </AdminSection>
        </div>

        <div className="flex flex-col gap-6">
          {/* Setup overview */}
          <AdminSection title="Setup overview" icon="ClipboardList">
            <ul className="flex flex-col gap-2">
              {(["not-started", "collecting-info", "in-design", "menu-prep", "review", "ready"] as const).map(
                (status) => {
                  const count = restaurants.filter((r) => r.setupStatus === status).length;
                  return (
                    <li key={status} className="flex items-center justify-between gap-2">
                      <StatusBadge group="restaurantSetup" value={status} />
                      <span className="text-small font-semibold text-text-primary">{count}</span>
                    </li>
                  );
                },
              )}
            </ul>
          </AdminSection>

          {/* Recent activity */}
          <PermissionGate user={user} permission={PERMISSIONS.ACTIVITY_VIEW}>
            <AdminSection title="Recent activity" icon="ScrollText">
              {activityR.ok ? (
                <ActivityFeed items={activityR.data} />
              ) : (
                <WidgetError label="activity" />
              )}
            </AdminSection>
          </PermissionGate>

          {/* Enquiry overview */}
          <PermissionGate user={user} permission={PERMISSIONS.ENQUIRY_VIEW}>
            <AdminSection
              title="Enquiry overview"
              icon="Inbox"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href={routes.admin.enquiries()}>View all</Link>
                </Button>
              }
            >
              {!enquiriesR.ok ? (
                <WidgetError label="enquiries" />
              ) : enquiriesR.data.length === 0 ? (
                <p className="text-small text-text-secondary">No enquiries yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {enquiriesR.data.slice(0, 4).map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-small font-medium text-text-primary">
                          {e.restaurantName}
                        </p>
                        <p className="truncate text-xs text-text-secondary">{e.contactPerson}</p>
                      </div>
                      <StatusBadge group="enquiry" value={e.status} />
                    </li>
                  ))}
                </ul>
              )}
            </AdminSection>
          </PermissionGate>

          {/* Quick actions */}
          <AdminSection title="Quick actions" icon="Zap">
            <div className="flex flex-col gap-2">
              <Button asChild variant="secondary" className="justify-start">
                <Link href={routes.admin.restaurantNew()}>
                  <Icon name="Plus" className="size-4" aria-hidden />
                  Add a restaurant
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href={routes.admin.restaurants()}>
                  <Icon name="Store" className="size-4" aria-hidden />
                  Manage restaurants
                </Link>
              </Button>
              <PermissionGate user={user} permission={PERMISSIONS.ANALYTICS_VIEW}>
                <Button asChild variant="secondary" className="justify-start">
                  <Link href={routes.admin.analytics()}>
                    <Icon name="BarChart3" className="size-4" aria-hidden />
                    View analytics
                  </Link>
                </Button>
              </PermissionGate>
            </div>
          </AdminSection>
        </div>
      </div>

      {isDemoMode ? (
        <p className="text-center text-xs text-text-tertiary">
          Demo mode — showing seed data. Set NEXT_PUBLIC_DEMO_MODE=false in production.
        </p>
      ) : null}
    </div>
  );
}
