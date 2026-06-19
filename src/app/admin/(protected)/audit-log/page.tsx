"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { ROLE_LABELS } from "@/domain/permissions";
import type { ActivityRecord } from "@/domain/entities";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";

type ViewMode = "table" | "feed";

function actionIntent(action: string): "danger" | "warning" | "success" | "neutral" {
  if (action.includes("archive") || action.includes("disable") || action.includes("delete")) {
    return "danger";
  }
  if (action.includes("publish") || action.includes("approve") || action.includes("create")) {
    return "success";
  }
  if (action.includes("review") || action.includes("pending")) return "warning";
  return "neutral";
}

export default function AuditLogPage() {
  const { toast } = useToast();

  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [actorRole, setActorRole] = useState("all");
  const [view, setView] = useState<ViewMode>("table");

  const load = useCallback(() => {
    try {
      setRecords(demoStore.audit.all());
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

  const resourceTypes = useMemo(
    () => Array.from(new Set(records.map((r) => r.resourceType))).sort(),
    [records],
  );
  const roles = useMemo(
    () => Array.from(new Set(records.map((r) => r.actorRole))).sort(),
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => {
        if (resourceType !== "all" && r.resourceType !== resourceType) return false;
        if (actorRole !== "all" && r.actorRole !== actorRole) return false;
        if (q) {
          const hay =
            `${r.action} ${r.resourceType} ${r.resourceId} ${r.description} ${r.actorRole}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice()
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [records, search, resourceType, actorRole]);

  const hasActiveFilters = search !== "" || resourceType !== "all" || actorRole !== "all";

  const resetFilters = () => {
    setSearch("");
    setResourceType("all");
    setActorRole("all");
  };

  const highRisk = records.filter((r) => actionIntent(r.action) === "danger").length;
  const publications = records.filter((r) => r.action.includes("publish")).length;
  const accessChanges = records.filter(
    (r) => r.resourceType === "admin-user" || r.resourceType === "team" || r.action.includes("access"),
  ).length;

  const filters: FilterConfig[] = [
    {
      id: "resourceType",
      label: "Resource type",
      value: resourceType,
      onChange: setResourceType,
      options: [
        { label: "All", value: "all" },
        ...resourceTypes.map((t) => ({ label: titleCase(t), value: t })),
      ],
    },
    {
      id: "actorRole",
      label: "Actor role",
      value: actorRole,
      onChange: setActorRole,
      options: [
        { label: "All", value: "all" },
        ...roles.map((r) => ({ label: ROLE_LABELS[r] ?? titleCase(r), value: r })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<ActivityRecord, unknown>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDate(row.original.timestamp, "en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        accessorKey: "actorRole",
        header: "Actor",
        cell: ({ row }) => (
          <span className="text-text-primary">{ROLE_LABELS[row.original.actorRole] ?? titleCase(row.original.actorRole)}</span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const intent = actionIntent(row.original.action);
          return (
            <span
              className={
                intent === "danger"
                  ? "inline-flex items-center gap-1.5 rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger"
                  : intent === "success"
                    ? "inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"
                    : intent === "warning"
                      ? "inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning"
                      : "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-container px-2.5 py-0.5 text-xs font-semibold text-text-secondary"
              }
            >
              {row.original.action}
            </span>
          );
        },
      },
      {
        accessorKey: "resourceType",
        header: "Resource",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {titleCase(row.original.resourceType)}
            <span className="ml-1 text-text-tertiary">·{" "}{row.original.resourceId}</span>
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        enableSorting: false,
        cell: ({ row }) => <span className="text-text-primary">{row.original.description}</span>,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Audit Log"
        description="An append-only, read-only history of important admin actions across the platform."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Audit Log" }]}
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Export started (demo)",
                description: "An approved audit report would download here in production.",
                intent: "info",
              })
            }
          >
            <Icon name="Download" className="size-4" aria-hidden />
            Export
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="ShieldCheck" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          Audit events are append-only and cannot be edited or deleted here. Secrets, tokens and
          full personal data are never shown.
        </p>
      </div>

      <section aria-label="Audit summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Total events" value={records.length} icon="ScrollText" />
        <AdminMetricCard label="High-risk changes" value={highRisk} icon="ShieldAlert" intent="warning" />
        <AdminMetricCard label="Publication changes" value={publications} icon="Globe" intent="success" />
        <AdminMetricCard label="Access changes" value={accessChanges} icon="UserCog" intent="primary" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by action, description, resource or role…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      >
        <div className="mb-0.5 flex items-center gap-1 rounded-[12px] border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={
              view === "table"
                ? "flex h-9 items-center gap-1.5 rounded-[8px] bg-canvas px-3 text-small font-semibold text-text-primary shadow-card"
                : "flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-small font-medium text-text-secondary hover:text-text-primary"
            }
          >
            <Icon name="Table" className="size-4" aria-hidden />
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("feed")}
            aria-pressed={view === "feed"}
            className={
              view === "feed"
                ? "flex h-9 items-center gap-1.5 rounded-[8px] bg-canvas px-3 text-small font-semibold text-text-primary shadow-card"
                : "flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-small font-medium text-text-secondary hover:text-text-primary"
            }
          >
            <Icon name="List" className="size-4" aria-hidden />
            Timeline
          </button>
        </div>
      </AdminFilterBar>

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading audit log…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load the audit log"
          description="The audit history failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : records.length === 0 ? (
        <EmptyState
          title="No audit events yet"
          description="Admin actions will be recorded here as they happen."
          icon="ScrollText"
        />
      ) : view === "feed" ? (
        <div className="rounded-[16px] border border-border bg-canvas p-5 shadow-card">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching events"
              description="No audit events match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          ) : (
            <ActivityFeed items={filtered} />
          )}
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="Audit log events"
          emptyState={
            <EmptyState
              title="No matching events"
              description="No audit events match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}
    </div>
  );
}
