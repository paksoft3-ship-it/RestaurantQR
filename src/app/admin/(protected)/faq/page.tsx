"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { faqSchema } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { PERMISSIONS } from "@/domain/permissions";
import type { FaqEntry } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminFilterBar, type FilterConfig } from "@/components/admin/admin-filter-bar";
import { FaqDialog } from "@/components/admin/faq-dialog";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function FaqPage() {
  const user = useAdminUser();
  const { toast } = useToast();
  const canEdit = Boolean(
    user &&
      (user.permissions.length > 0
        ? user.permissions.includes(PERMISSIONS.WEBSITE_EDIT)
        : true),
  );

  const [entries, setEntries] = useState<FaqEntry[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<FaqEntry | null>(null);
  const [deleting, setDeleting] = useState<FaqEntry | null>(null);

  const form = useForm<z.input<typeof faqSchema>, unknown, z.output<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues: { category: "", question: "", answer: "", status: "draft" },
  });

  const load = useCallback(() => {
    try {
      setEntries([...demoStore.faq.all()].sort((a, b) => a.sortOrder - b.sortOrder));
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

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category))).sort(),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (q) {
        const hay = `${e.category} ${e.question} ${e.answer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, category]);

  const hasActiveFilters = search !== "" || category !== "all";
  const resetFilters = () => {
    setSearch("");
    setCategory("all");
  };

  const publishedCount = entries.filter((e) => e.status === "published").length;

  const openCreate = () => {
    setEditing(null);
    setDialogMode("create");
    form.reset({ category: "", question: "", answer: "", status: "draft" });
  };

  const openEdit = (entry: FaqEntry) => {
    setEditing(entry);
    setDialogMode("edit");
    form.reset({
      category: entry.category,
      question: entry.question,
      answer: entry.answer,
      status: entry.status,
    });
  };

  const onSubmit = form.handleSubmit((input) => {
    if (dialogMode === "edit" && editing) {
      demoStore.faq.update(editing.id, {
        category: input.category,
        question: input.question,
        answer: input.answer,
        status: input.status,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: input.status === "published" ? "faq.published" : "faq.updated",
        resourceType: "faq",
        resourceId: editing.id,
        description: `Updated FAQ “${input.question}” → ${titleCase(input.status)}`,
      });
      toast({ title: "FAQ updated", intent: "success" });
    } else {
      const id = createId("faq");
      const maxSort = entries.reduce((max, e) => Math.max(max, e.sortOrder), 0);
      demoStore.faq.create({
        id,
        category: input.category,
        question: input.question,
        answer: input.answer,
        status: input.status,
        sortOrder: maxSort + 1,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "user_unknown",
        actorRole: user?.role ?? "website-content-manager",
        action: "faq.created",
        resourceType: "faq",
        resourceId: id,
        description: `Created FAQ “${input.question}”`,
      });
      toast({
        title: "FAQ created",
        description: "Saved as a draft. Publishing remains an explicit step.",
        intent: "success",
      });
    }
    setDialogMode(null);
    setEditing(null);
  });

  const confirmDelete = () => {
    if (!deleting) return;
    demoStore.faq.remove(deleting.id);
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "website-content-manager",
      action: "faq.deleted",
      resourceType: "faq",
      resourceId: deleting.id,
      description: `Deleted FAQ “${deleting.question}”`,
    });
    toast({ title: "FAQ deleted", intent: "success" });
    setDeleting(null);
  };

  const filters: FilterConfig[] = [
    {
      id: "category",
      label: "Category",
      value: category,
      onChange: setCategory,
      options: [
        { label: "All categories", value: "all" },
        ...categories.map((c) => ({ label: titleCase(c), value: c })),
      ],
    },
  ];

  const columns = useMemo<ColumnDef<FaqEntry, unknown>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
            {titleCase(row.original.category)}
          </span>
        ),
      },
      {
        accessorKey: "question",
        header: "Question",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.question}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge group="publishing" value={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) =>
          canEdit ? (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEdit(row.original)}
                aria-label={`Edit ${row.original.question}`}
              >
                <Icon name="Pencil" className="size-4" aria-hidden />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleting(row.original)}
                aria-label={`Delete ${row.original.question}`}
              >
                <Icon name="Trash2" className="size-4" aria-hidden />
              </Button>
            </div>
          ) : (
            <span className="text-xs text-text-tertiary">View only</span>
          ),
      },
    ],
    // openEdit/setDeleting are stable enough for this demo surface.
    [canEdit],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="FAQ"
        description="Manage the frequently asked questions shown on the public FAQ page. Publishing is always an explicit, reviewed step."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "FAQ" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={routes.marketing.faq()} target="_blank" rel="noreferrer">
                <Icon name="ExternalLink" className="size-4" aria-hidden />
                View public page
              </Link>
            </Button>
            <PermissionGate user={user} permission={PERMISSIONS.WEBSITE_EDIT}>
              <Button onClick={openCreate}>
                <Icon name="Plus" className="size-4" aria-hidden />
                New question
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

      <section aria-label="FAQ metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <AdminMetricCard label="Questions" value={entries.length} icon="HelpCircle" />
        <AdminMetricCard label="Published" value={publishedCount} icon="Globe" intent="success" />
        <AdminMetricCard label="Categories" value={categories.length} icon="Tags" intent="primary" />
      </section>

      <AdminFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search questions, answers or categories…"
        filters={filters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {!ready ? (
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading FAQ…
        </div>
      ) : failed ? (
        <ErrorState
          title="Couldn't load the FAQ"
          description="The FAQ entries failed to load. Try again."
          action={{ label: "Retry", onClick: load }}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Create your first FAQ entry."
          icon="HelpCircle"
          action={user ? { label: "New question", onClick: openCreate } : undefined}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={filtered}
          getRowId={(r) => r.id}
          caption="FAQ entries"
          emptyState={
            <EmptyState
              title="No matching questions"
              description="No FAQ entries match your search and filters."
              icon="Search"
              action={hasActiveFilters ? { label: "Clear filters", onClick: resetFilters } : undefined}
            />
          }
        />
      )}

      <FaqDialog
        open={dialogMode !== null}
        mode={dialogMode ?? "create"}
        form={form}
        categories={categories}
        onClose={() => {
          setDialogMode(null);
          setEditing(null);
        }}
        onSubmit={onSubmit}
      />

      <ConfirmationDialog
        open={deleting !== null}
        title="Delete this question?"
        description={
          deleting
            ? `“${deleting.question}” will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete question"
        intent="danger"
        icon="Trash2"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
