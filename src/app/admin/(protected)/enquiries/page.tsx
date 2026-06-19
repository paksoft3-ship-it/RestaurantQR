"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { enquiryUpdateSchema, type EnquiryUpdateInput } from "@/domain/schemas";
import { ENQUIRY_STATUSES } from "@/domain/enums";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { teamSuggestions } from "@/components/admin/restaurant-form-options";
import type { Enquiry } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { EnquiryDetailDrawer } from "@/components/admin/enquiry-detail-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function EnquiriesPage() {
  const user = useAdminUser();
  const { toast } = useToast();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<Enquiry | null>(null);

  const form = useForm<z.input<typeof enquiryUpdateSchema>, unknown, EnquiryUpdateInput>({
    resolver: zodResolver(enquiryUpdateSchema),
    defaultValues: { status: "new", assignedTeam: "" },
  });

  const load = useCallback(() => {
    try {
      setEnquiries(demoStore.enquiries.all());
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

  const openDetail = useCallback(
    (enquiry: Enquiry) => {
      setActive(enquiry);
      form.reset({ status: enquiry.status, assignedTeam: enquiry.assignedTeam ?? "" });
    },
    [form],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (q) {
        const hay =
          `${e.restaurantName} ${e.contactPerson} ${e.email} ${e.enquiryType} ${e.city ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enquiries, search, status]);

  const hasActiveFilters = search !== "" || status !== "all";
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0])) as Record<
      (typeof ENQUIRY_STATUSES)[number],
      number
    >;
    enquiries.forEach((e) => {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    });
    return byStatus;
  }, [enquiries]);

  const onSubmit = form.handleSubmit((input) => {
    if (!active) return;
    const assignedTeam = input.assignedTeam ? input.assignedTeam : null;
    demoStore.enquiries.update(active.id, { status: input.status, assignedTeam });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "support-team",
      action: "enquiry.updated",
      resourceType: "enquiry",
      resourceId: active.id,
      description: `Updated enquiry from ${active.restaurantName} → ${titleCase(input.status)}${
        assignedTeam ? ` (assigned ${assignedTeam})` : ""
      }`,
    });
    toast({
      title: "Enquiry updated",
      description: `${active.restaurantName} is now ${titleCase(input.status)}. This is a demo lead; no email was sent.`,
      intent: "success",
    });
    setActive(null);
  });

  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      value: status,
      onChange: setStatus,
      options: [
        { label: "All", value: "all" },
        ...ENQUIRY_STATUSES.map((s) => ({ label: titleCase(s), value: s })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<Enquiry, unknown>[]>(
    () => [
      {
        accessorKey: "restaurantName",
        header: "Enquiry",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openDetail(row.original)}
            className="text-left font-semibold text-text-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {row.original.restaurantName}
          </button>
        ),
      },
      {
        accessorKey: "contactPerson",
        header: "Contact",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="text-text-primary">{row.original.contactPerson}</p>
            <p className="truncate text-xs text-text-secondary">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "enquiryType",
        header: "Type",
        cell: ({ row }) => (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
            {titleCase(row.original.enquiryType)}
          </span>
        ),
      },
      {
        id: "assignedTeam",
        header: "Owner",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.assignedTeam ? (
            <span className="text-text-primary">{row.original.assignedTeam}</span>
          ) : (
            <span className="text-xs text-text-tertiary">Unassigned</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="enquiry" value={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Received",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDetail(row.original)}
            aria-label={`Open enquiry from ${row.original.restaurantName}`}
          >
            <Icon name="Eye" className="size-4" aria-hidden />
            View
          </Button>
        ),
      },
    ],
    [openDetail],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Leads & Quote Requests"
        description="Review, qualify and assign restaurant enquiries. These are demo leads — no automated email or calls are sent."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Enquiries" }]}
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Export started (demo)",
                description: "A CSV of leads would download here in production.",
                intent: "info",
              })
            }
          >
            <Icon name="Download" className="size-4" aria-hidden />
            Export
          </Button>
        }
      />

      <section aria-label="Lead metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <AdminMetricCard label="Total" value={enquiries.length} icon="Inbox" />
        <AdminMetricCard label="New" value={counts.new} icon="Sparkles" intent="primary" />
        <AdminMetricCard label="In review" value={counts["in-review"]} icon="Eye" intent="warning" />
        <AdminMetricCard label="Contacted" value={counts.contacted} icon="PhoneCall" />
        <AdminMetricCard label="Qualified" value={counts.qualified} icon="CheckCircle2" intent="success" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by restaurant, contact, email or type…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading enquiries…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load enquiries"
          description="The lead list failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : enquiries.length === 0 ? (
        <EmptyState
          title="No enquiries yet"
          description="New restaurant enquiries from the public contact form will appear here."
          icon="Inbox"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(e) => e.id}
          caption="Restaurant enquiries"
          emptyState={
            <EmptyState
              title="No matching enquiries"
              description="No leads match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      <EnquiryDetailDrawer
        enquiry={active}
        form={form}
        teamOptions={teamSuggestions}
        onClose={() => setActive(null)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
