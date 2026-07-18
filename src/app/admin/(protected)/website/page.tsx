"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { websiteContentSchema, type WebsiteContentInput } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, formatDate, titleCase } from "@/lib/utils";
import type { WebsiteContentBlock } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { WebsiteBlockDialog } from "@/components/admin/website-block-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function WebsitePage() {
  const user = useAdminUser();
  const { toast } = useToast();

  const [blocks, setBlocks] = useState<WebsiteContentBlock[]>([]);
  const [ready, setReady] = useState(false);

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<WebsiteContentBlock | null>(null);

  const form = useForm<z.input<typeof websiteContentSchema>, unknown, WebsiteContentInput>({
    resolver: zodResolver(websiteContentSchema),
    defaultValues: { page: "", section: "", title: "", body: "", status: "draft" },
  });

  const load = useCallback(() => {
    setBlocks(demoStore.websiteContent.all());
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
    form.reset({ page: "", section: "", title: "", body: "", status: "draft" });
  };

  const openEdit = useCallback(
    (block: WebsiteContentBlock) => {
      setEditing(block);
      setDialogMode("edit");
      form.reset({
        page: block.page,
        section: block.section,
        title: block.title,
        body: block.body,
        status: block.status,
      });
    },
    [form],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, WebsiteContentBlock[]>();
    blocks.forEach((b) => {
      const list = map.get(b.page) ?? [];
      list.push(b);
      map.set(b.page, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [blocks]);

  const publishedCount = blocks.filter((b) => b.status === "published").length;
  const draftCount = blocks.filter((b) => b.status === "draft").length;

  const onSubmit = form.handleSubmit((input) => {
    if (dialogMode === "edit" && editing) {
      demoStore.websiteContent.update(editing.id, {
        page: input.page,
        section: input.section,
        title: input.title,
        body: input.body,
        status: input.status,
        updatedAt: new Date().toISOString(),
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: input.status === "published" ? "website.published" : "website.updated",
        resourceType: "website-content",
        resourceId: editing.id,
        description: `Updated “${input.title}” (${input.page}/${input.section}) → ${titleCase(input.status)}`,
      });
      toast({ title: "Content block updated", intent: "success" });
    } else {
      const id = createId("wc");
      demoStore.websiteContent.create({
        id,
        page: input.page,
        section: input.section,
        title: input.title,
        body: input.body,
        status: input.status,
        updatedAt: new Date().toISOString(),
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: "website.created",
        resourceType: "website-content",
        resourceId: id,
        description: `Created “${input.title}” (${input.page}/${input.section})`,
      });
      toast({
        title: "Content block created",
        description: "Saved as a content block. Publishing remains an explicit step.",
        intent: "success",
      });
    }
    setDialogMode(null);
    setEditing(null);
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Public Website CMS"
        description="Manage marketing-website content blocks grouped by page. Publishing is always an explicit, reviewed step — never automatic."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Website CMS" }]}
        actions={
          <Button onClick={openCreate}>
            <Icon name="Plus" className="size-4" aria-hidden />
            New block
          </Button>
        }
      />

      <section aria-label="Website metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AdminMetricCard label="Content blocks" value={blocks.length} icon="LayoutTemplate" />
        <AdminMetricCard label="Published" value={publishedCount} icon="Globe" intent="success" />
        <AdminMetricCard label="Drafts" value={draftCount} icon="FileEdit" intent="warning" />
      </section>

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          Published blocks drive the matching marketing-page copy (e.g. home hero &amp; CTA, about
          intro, features lead). The workflow is draft → in review → published; saving a draft never
          changes what is live — publishing does. Sections without a published block keep their
          built-in copy.
        </p>
      </div>

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading website content…
        </div>
      ) : blocks.length === 0 ? (
        <EmptyState
          title="No content blocks yet"
          description="Create your first marketing-website content block."
          icon="LayoutTemplate"
          action={{ label: "New block", onClick: openCreate }}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([page, pageBlocks]) => (
            <AdminSection
              key={page}
              title={titleCase(page)}
              icon="File"
              description={`${pageBlocks.length} ${pageBlocks.length === 1 ? "block" : "blocks"}`}
            >
              <ul className="flex flex-col divide-y divide-border">
                {pageBlocks.map((block) => (
                  <li
                    key={block.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text-primary">{block.title}</p>
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                          {block.section}
                        </span>
                        <StatusBadge group="publishing" value={block.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-small text-text-secondary">
                        {block.body}
                      </p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        Updated {formatDate(block.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(block)}
                      aria-label={`Edit ${block.title}`}
                    >
                      <Icon name="Pencil" className="size-4" aria-hidden />
                      Edit
                    </Button>
                  </li>
                ))}
              </ul>
            </AdminSection>
          ))}
        </div>
      )}

      <WebsiteBlockDialog
        open={dialogMode !== null}
        mode={dialogMode ?? "create"}
        form={form}
        onClose={() => {
          setDialogMode(null);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />
    </div>
  );
}
