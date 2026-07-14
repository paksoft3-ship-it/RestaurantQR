"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { packageSchema } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { PERMISSIONS } from "@/domain/permissions";
import type { PackagePlan } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { PackageDialog } from "@/components/admin/package-dialog";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function PackagesPage() {
  const user = useAdminUser();
  const { toast } = useToast();

  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<PackagePlan | null>(null);
  const [archiving, setArchiving] = useState<PackagePlan | null>(null);

  const form = useForm<z.input<typeof packageSchema>, unknown, z.output<typeof packageSchema>>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      summary: "",
      features: [""],
      highlighted: false,
      badge: "",
      status: "draft",
    },
  });

  const load = useCallback(() => {
    try {
      setPackages([...demoStore.packages.all()].sort((a, b) => a.sortOrder - b.sortOrder));
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

  const openCreate = () => {
    setEditing(null);
    setDialogMode("create");
    form.reset({
      name: "",
      summary: "",
      features: [""],
      highlighted: false,
      badge: "",
      status: "draft",
    });
  };

  const openEdit = (plan: PackagePlan) => {
    setEditing(plan);
    setDialogMode("edit");
    form.reset({
      name: plan.name,
      summary: plan.summary,
      features: plan.features.length > 0 ? plan.features : [""],
      highlighted: plan.highlighted,
      badge: plan.badge ?? "",
      status: plan.status,
    });
  };

  const publishedCount = packages.filter((p) => p.status === "published").length;
  const highlightedCount = packages.filter((p) => p.highlighted).length;

  const move = (plan: PackagePlan, direction: "up" | "down") => {
    const index = packages.findIndex((p) => p.id === plan.id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= packages.length) return;
    const next = [...packages];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    demoStore.packages.reorder(next.map((p) => p.id));
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "website-content-manager",
      action: "package.reordered",
      resourceType: "package",
      resourceId: plan.id,
      description: `Reordered package “${plan.name}”`,
    });
    toast({ title: "Order updated", intent: "success" });
  };

  const onSubmit = form.handleSubmit((input) => {
    const features = input.features.map((f) => f.trim()).filter((f) => f.length > 0);
    const badge = input.badge?.trim() ? input.badge.trim() : null;
    if (dialogMode === "edit" && editing) {
      demoStore.packages.update(editing.id, {
        name: input.name,
        summary: input.summary,
        features,
        highlighted: input.highlighted,
        badge,
        status: input.status,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: input.status === "published" ? "package.published" : "package.updated",
        resourceType: "package",
        resourceId: editing.id,
        description: `Updated package “${input.name}” → ${titleCase(input.status)}`,
      });
      toast({ title: "Package updated", intent: "success" });
    } else {
      const id = createId("pkg");
      const maxSort = packages.reduce((max, p) => Math.max(max, p.sortOrder), 0);
      demoStore.packages.create({
        id,
        name: input.name,
        summary: input.summary,
        features,
        highlighted: input.highlighted,
        badge,
        status: input.status,
        sortOrder: maxSort + 1,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: "package.created",
        resourceType: "package",
        resourceId: id,
        description: `Created package “${input.name}”`,
      });
      toast({
        title: "Package created",
        description: "Saved as a draft. Publishing remains an explicit step.",
        intent: "success",
      });
    }
    setDialogMode(null);
    setEditing(null);
  });

  const confirmArchive = () => {
    if (!archiving) return;
    demoStore.packages.update(archiving.id, { status: "archived" });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "website-content-manager",
      action: "package.archived",
      resourceType: "package",
      resourceId: archiving.id,
      description: `Archived package “${archiving.name}”`,
    });
    toast({ title: "Package archived", intent: "success" });
    setArchiving(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Packages"
        description="Manage the managed-service packages shown on the public packages page. Pricing is handled as a managed quote — no prices are stored here."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Packages" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={routes.marketing.packages()} target="_blank" rel="noreferrer">
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                View public page
              </Link>
            </Button>
            <PermissionGate user={user} permission={PERMISSIONS.WEBSITE_EDIT}>
              <Button onClick={openCreate}>
                <Icon name="Plus" className="size-4" aria-hidden />
                New package
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          Changes save to the database. The status workflow is draft → in review →
          published; only Published entries appear on the public site.
        </p>
      </div>

      <section aria-label="Package metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Packages" value={packages.length} icon="Package" />
        <AdminMetricCard label="Published" value={publishedCount} icon="Globe" intent="success" />
        <AdminMetricCard label="Highlighted" value={highlightedCount} icon="Star" intent="primary" />
      </section>

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading packages…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load packages"
          description="The packages failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : packages.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Create your first managed-service package."
          icon="Package"
          action={user ? { label: "New package", onClick: openCreate } : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {packages.map((plan, index) => (
            <li
              key={plan.id}
              className="flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{plan.name}</p>
                    {plan.highlighted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        <Icon name="Star" className="size-3" aria-hidden />
                        {plan.badge ?? "Most popular"}
                      </span>
                    ) : plan.badge ? (
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-small text-text-secondary">{plan.summary}</p>
                </div>
                <StatusBadge group="publishing" value={plan.status} />
              </div>

              <p className="text-xs font-medium text-text-tertiary">
                {plan.features.length} {plan.features.length === 1 ? "feature" : "features"}
              </p>
              <ul className="flex flex-col gap-1">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-small text-text-secondary">
                    <Icon
                      name="Check"
                      className="mt-0.5 size-3.5 shrink-0 text-success"
                      aria-hidden
                    />
                    {feature}
                  </li>
                ))}
                {plan.features.length > 4 ? (
                  <li className="text-xs text-text-tertiary">
                    +{plan.features.length - 4} more
                  </li>
                ) : null}
              </ul>

              <PermissionGate user={user} permission={PERMISSIONS.WEBSITE_EDIT}>
                <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(plan)}
                    aria-label={`Edit ${plan.name}`}
                  >
                    <Icon name="Pencil" className="size-4" aria-hidden />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(plan, "up")}
                    disabled={index === 0}
                    aria-label={`Move ${plan.name} up`}
                  >
                    <Icon name="ArrowUp" className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => move(plan, "down")}
                    disabled={index === packages.length - 1}
                    aria-label={`Move ${plan.name} down`}
                  >
                    <Icon name="ArrowDown" className="size-4" aria-hidden />
                  </Button>
                  {plan.status !== "archived" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setArchiving(plan)}
                      aria-label={`Archive ${plan.name}`}
                    >
                      <Icon name="Archive" className="size-4" aria-hidden />
                      Archive
                    </Button>
                  ) : null}
                </div>
              </PermissionGate>
            </li>
          ))}
        </ul>
      )}

      <PackageDialog
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
        open={archiving !== null}
        title="Archive this package?"
        description={
          archiving
            ? `“${archiving.name}” will be archived and hidden from the public packages page. You can restore it by editing its status.`
            : undefined
        }
        confirmLabel="Archive package"
        intent="danger"
        icon="Archive"
        onConfirm={confirmArchive}
        onCancel={() => setArchiving(null)}
      />
    </div>
  );
}
