"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { templateSchema } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { PERMISSIONS } from "@/domain/permissions";
import type { Template } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { TemplateDialog } from "@/components/admin/template-dialog";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function TemplatesPage() {
  const user = useAdminUser();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [archiving, setArchiving] = useState<Template | null>(null);

  const form = useForm<z.input<typeof templateSchema>, unknown, z.output<typeof templateSchema>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      direction: "modern-fast-food",
      description: "",
      bestFor: "",
      status: "draft",
    },
  });

  const load = useCallback(() => {
    try {
      setTemplates([...demoStore.templates.all()].sort((a, b) => a.sortOrder - b.sortOrder));
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
      direction: "modern-fast-food",
      description: "",
      bestFor: "",
      status: "draft",
    });
  };

  const openEdit = (template: Template) => {
    setEditing(template);
    setDialogMode("edit");
    form.reset({
      name: template.name,
      direction: template.direction,
      description: template.description,
      bestFor: template.bestFor,
      status: template.status,
    });
  };

  const publishedCount = templates.filter((t) => t.status === "published").length;
  const draftCount = templates.filter((t) => t.status === "draft").length;

  const move = (template: Template, direction: "up" | "down") => {
    const index = templates.findIndex((t) => t.id === template.id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= templates.length) return;
    const next = [...templates];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    demoStore.templates.reorder(next.map((t) => t.id));
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "website-content-manager",
      action: "template.reordered",
      resourceType: "template",
      resourceId: template.id,
      description: `Reordered template “${template.name}”`,
    });
    toast({ title: "Order updated", intent: "success" });
  };

  const onSubmit = form.handleSubmit((input) => {
    if (dialogMode === "edit" && editing) {
      demoStore.templates.update(editing.id, {
        name: input.name,
        direction: input.direction,
        description: input.description,
        bestFor: input.bestFor,
        status: input.status,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: input.status === "published" ? "template.published" : "template.updated",
        resourceType: "template",
        resourceId: editing.id,
        description: `Updated template “${input.name}” → ${titleCase(input.status)}`,
      });
      toast({ title: "Template updated", intent: "success" });
    } else {
      const id = createId("tpl");
      const maxSort = templates.reduce((max, t) => Math.max(max, t.sortOrder), 0);
      demoStore.templates.create({
        id,
        name: input.name,
        direction: input.direction,
        description: input.description,
        bestFor: input.bestFor,
        image: null,
        status: input.status,
        sortOrder: maxSort + 1,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: "template.created",
        resourceType: "template",
        resourceId: id,
        description: `Created template “${input.name}”`,
      });
      toast({
        title: "Template created",
        description: "Saved as a draft. Publishing remains an explicit step.",
        intent: "success",
      });
    }
    setDialogMode(null);
    setEditing(null);
  });

  const confirmArchive = () => {
    if (!archiving) return;
    demoStore.templates.update(archiving.id, { status: "archived" });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "website-content-manager",
      action: "template.archived",
      resourceType: "template",
      resourceId: archiving.id,
      description: `Archived template “${archiving.name}”`,
    });
    toast({ title: "Template archived", intent: "success" });
    setArchiving(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Templates"
        description="Manage the visual-direction templates shown in the public templates gallery. Publishing is always an explicit, reviewed step."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Templates" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={routes.marketing.templates()} target="_blank" rel="noreferrer">
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                View public page
              </Link>
            </Button>
            <PermissionGate user={user} permission={PERMISSIONS.WEBSITE_EDIT}>
              <Button onClick={openCreate}>
                <Icon name="Plus" className="size-4" aria-hidden />
                New template
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          Edits here are demo-only and persist in your browser. The status workflow is draft → in
          review → published, and no change is pushed to the live site.
        </p>
      </div>

      <section aria-label="Template metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Templates" value={templates.length} icon="LayoutTemplate" />
        <AdminMetricCard label="Published" value={publishedCount} icon="Globe" intent="success" />
        <AdminMetricCard label="Drafts" value={draftCount} icon="FileEdit" />
      </section>

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading templates…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load templates"
          description="The templates failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Create your first visual-direction template."
          icon="LayoutTemplate"
          action={user ? { label: "New template", onClick: openCreate } : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {templates.map((template, index) => (
            <li
              key={template.id}
              className="flex flex-col gap-4 rounded-[16px] border border-border bg-canvas p-4 shadow-card sm:flex-row"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface sm:h-24 sm:w-32">
                <Image
                  src={template.image ?? "/placeholders/restaurant.svg"}
                  alt={`${template.name} template preview`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-text-primary">{template.name}</p>
                  <StatusBadge group="publishing" value={template.status} />
                </div>
                <p className="text-xs font-medium text-text-secondary">
                  {titleCase(template.direction)}
                </p>
                <p className="line-clamp-2 text-small text-text-secondary">
                  {template.description}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">Best for: {template.bestFor}</p>

                <PermissionGate user={user} permission={PERMISSIONS.WEBSITE_EDIT}>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(template)}
                      aria-label={`Edit ${template.name}`}
                    >
                      <Icon name="Pencil" className="size-4" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => move(template, "up")}
                      disabled={index === 0}
                      aria-label={`Move ${template.name} up`}
                    >
                      <Icon name="ArrowUp" className="size-4" aria-hidden />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => move(template, "down")}
                      disabled={index === templates.length - 1}
                      aria-label={`Move ${template.name} down`}
                    >
                      <Icon name="ArrowDown" className="size-4" aria-hidden />
                    </Button>
                    {template.status !== "archived" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setArchiving(template)}
                        aria-label={`Archive ${template.name}`}
                      >
                        <Icon name="Archive" className="size-4" aria-hidden />
                        Archive
                      </Button>
                    ) : null}
                  </div>
                </PermissionGate>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TemplateDialog
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
        title="Archive this template?"
        description={
          archiving
            ? `“${archiving.name}” will be archived and hidden from the public gallery. You can restore it by editing its status.`
            : undefined
        }
        confirmLabel="Archive template"
        intent="danger"
        icon="Archive"
        onConfirm={confirmArchive}
        onCancel={() => setArchiving(null)}
      />
    </div>
  );
}
