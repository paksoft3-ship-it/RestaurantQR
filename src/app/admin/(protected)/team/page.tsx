"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { ColumnDef } from "@tanstack/react-table";
import { teamUserSchema, type TeamUserInput } from "@/domain/schemas";
import {
  PERMISSIONS,
  ROLES,
  ROLE_LABELS,
  permissionsForRole,
  type Role,
} from "@/domain/permissions";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import type { AdminUser } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { TeamUserDialog } from "@/components/admin/team-user-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const STATUS_INTENT: Record<AdminUser["status"], "success" | "neutral" | "danger"> = {
  active: "success",
  inactive: "neutral",
  locked: "danger",
};

const STATUS_ICON: Record<AdminUser["status"], string> = {
  active: "CheckCircle2",
  inactive: "MinusCircle",
  locked: "Lock",
};

export default function TeamPage() {
  const user = useAdminUser();
  const { toast } = useToast();

  const [members, setMembers] = useState<AdminUser[]>([]);
  const [ready, setReady] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deactivate, setDeactivate] = useState<AdminUser | null>(null);

  const form = useForm<z.input<typeof teamUserSchema>, unknown, TeamUserInput>({
    resolver: zodResolver(teamUserSchema),
    defaultValues: { displayName: "", email: "", role: "support-team", status: "active" },
  });

  const load = useCallback(() => {
    setMembers(demoStore.team.all());
    setReady(true);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDialogMode("create");
    form.reset({ displayName: "", email: "", role: "support-team", status: "active" });
  };

  const openEdit = useCallback(
    (member: AdminUser) => {
      setEditing(member);
      setDialogMode("edit");
      form.reset({
        displayName: member.displayName,
        email: member.email,
        role: member.role,
        status: member.status,
      });
    },
    [form],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (q) {
        const hay = `${m.displayName} ${m.email} ${ROLE_LABELS[m.role]}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [members, search, roleFilter, statusFilter]);

  const hasActiveFilters = search !== "" || roleFilter !== "all" || statusFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const lockedCount = members.filter((m) => m.status === "locked").length;
  const inactiveCount = members.filter((m) => m.status === "inactive").length;

  const onSubmit = form.handleSubmit((input) => {
    if (dialogMode === "edit" && editing) {
      demoStore.team.update(editing.id, {
        displayName: input.displayName,
        email: input.email,
        role: input.role,
        status: input.status,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "administrator",
        action: "admin-user.updated",
        resourceType: "admin-user",
        resourceId: editing.id,
        description: `Updated team member ${input.displayName} (${ROLE_LABELS[input.role]})`,
      });
      toast({ title: "Team member updated", intent: "success" });
    } else {
      const id = createId("user");
      const created: AdminUser = {
        id,
        displayName: input.displayName,
        email: input.email,
        role: input.role,
        status: input.status,
        permissions: [],
      };
      demoStore.team.create(created);
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "administrator",
        action: "admin-user.created",
        resourceType: "admin-user",
        resourceId: id,
        description: `Invited team member ${input.displayName} (${ROLE_LABELS[input.role]})`,
      });
      toast({
        title: "Team member added",
        description: "Invitation is simulated in this demo; no email was sent.",
        intent: "success",
      });
    }
    setDialogMode(null);
    setEditing(null);
  });

  const confirmDeactivate = () => {
    if (!deactivate) return;
    demoStore.team.update(deactivate.id, { status: "inactive" });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "administrator",
      action: "admin-user.deactivated",
      resourceType: "admin-user",
      resourceId: deactivate.id,
      description: `Deactivated team member ${deactivate.displayName}`,
    });
    toast({
      title: "Team member deactivated",
      description: "Access was set to inactive. The record is kept and can be reactivated.",
      intent: "success",
    });
    setDeactivate(null);
  };

  const canManage = Boolean(
    user &&
      (user.permissions.length > 0 ? user.permissions : permissionsForRole(user.role)).includes(
        PERMISSIONS.ADMIN_MANAGE,
      ),
  );

  const filters: FilterConfig[] = [
    {
      id: "role",
      label: "Role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { label: "All", value: "all" },
        ...ROLES.map((r) => ({ label: ROLE_LABELS[r], value: r })),
      ],
    },
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Locked", value: "locked" },
      ],
    },
  ];

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: "Member",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-semibold text-text-primary">{row.original.displayName}</p>
            <p className="truncate text-xs text-text-secondary">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <span className="text-text-primary">{ROLE_LABELS[row.original.role]}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge intent={STATUS_INTENT[row.original.status]}>
            <Icon name={STATUS_ICON[row.original.status]} className="size-3.5" aria-hidden />
            {titleCase(row.original.status)}
          </Badge>
        ),
      },
      {
        id: "permissions",
        header: "Permissions",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {permissionsForRole(row.original.role).length} granted
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <PermissionGate
            user={user}
            permission={PERMISSIONS.ADMIN_MANAGE}
            fallback={<span className="text-xs text-text-tertiary">View only</span>}
          >
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(row.original)}
                aria-label={`Edit ${row.original.displayName}`}
              >
                <Icon name="Pencil" className="size-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={row.original.status === "inactive"}
                onClick={() => setDeactivate(row.original)}
                aria-label={`Deactivate ${row.original.displayName}`}
              >
                <Icon name="UserMinus" className="size-4" aria-hidden />
              </Button>
            </div>
          </PermissionGate>
        ),
      },
    ],
    [user, openEdit],
  );

  const selectedRole: Role = (form.watch("role") as Role) ?? "support-team";

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Users & Team"
        description="Internal YourPlatform administrator accounts. Management actions require the Admin Manage permission."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Team" }]}
        actions={
          <PermissionGate user={user} permission={PERMISSIONS.ADMIN_MANAGE}>
            <Button onClick={openCreate}>
              <Icon name="UserPlus" className="size-4" aria-hidden />
              Invite member
            </Button>
          </PermissionGate>
        }
      />

      {!canManage ? (
        <div className="flex items-start gap-3 rounded-[16px] border border-warning/30 bg-warning/5 p-4">
          <Icon name="Lock" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <p className="text-small text-text-secondary">
            You have read-only access to the team list. Editing members requires the Admin Manage
            permission.
          </p>
        </div>
      ) : null}

      <section aria-label="Team metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Members" value={members.length} icon="Users" />
        <AdminMetricCard label="Active" value={activeCount} icon="CheckCircle2" intent="success" />
        <AdminMetricCard label="Locked" value={lockedCount} icon="Lock" intent="warning" />
        <AdminMetricCard label="Inactive" value={inactiveCount} icon="MinusCircle" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email or role…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading team…
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          title="No team members"
          description="Invite your first administrator to get started."
          icon="Users"
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(m) => m.id}
          caption="Admin team members"
          emptyState={
            <EmptyState
              title="No matching members"
              description="No team members match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      <AdminSection
        title="Role & permission summary"
        icon="ShieldCheck"
        description={`Default grants for ${ROLE_LABELS[selectedRole]} (matches the role selected in the dialog).`}
      >
        <div className="flex flex-wrap gap-1.5">
          {permissionsForRole(selectedRole).map((p) => (
            <span
              key={p}
              className="rounded-full bg-surface-warm px-2 py-0.5 text-xs font-medium text-primary"
            >
              {p}
            </span>
          ))}
        </div>
      </AdminSection>

      <TeamUserDialog
        open={dialogMode !== null}
        mode={dialogMode ?? "create"}
        form={form}
        onClose={() => {
          setDialogMode(null);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />

      <ConfirmationDialog
        open={deactivate !== null}
        title="Deactivate team member?"
        description={
          deactivate
            ? `${deactivate.displayName} will be set to inactive and lose access. This is non-destructive — the record is kept and can be reactivated later.`
            : undefined
        }
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        intent="danger"
        icon="UserMinus"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivate(null)}
      />
    </div>
  );
}
