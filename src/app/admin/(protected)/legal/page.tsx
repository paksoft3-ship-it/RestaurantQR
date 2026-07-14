"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { PERMISSIONS } from "@/domain/permissions";
import type { LegalPage, LegalSection } from "@/domain/entities";
import type { LegalPageType } from "@/domain/enums";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { LegalPageEditor } from "@/components/admin/legal-page-editor";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

function publicRouteFor(type: LegalPageType): string {
  switch (type) {
    case "privacy":
      return routes.marketing.privacy();
    case "cookies":
      return routes.marketing.cookies();
    case "terms":
      return routes.marketing.terms();
    case "campaign-terms":
      return routes.marketing.campaignTerms();
    default:
      return routes.marketing.home();
  }
}

export default function LegalPagesPage() {
  const user = useAdminUser();
  const { toast } = useToast();
  const canEdit = Boolean(
    user &&
      (user.permissions.length > 0 ? user.permissions.includes(PERMISSIONS.LEGAL_EDIT) : true),
  );

  const [pages, setPages] = useState<LegalPage[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(() => {
    try {
      setPages(demoStore.legal.all());
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

  const editingPage = useMemo(
    () => pages.find((p) => p.id === editingId) ?? null,
    [pages, editingId],
  );

  const publishedCount = pages.filter((p) => p.status === "published").length;
  const draftCount = pages.filter((p) => p.status === "draft").length;

  const handleSave = (
    page: LegalPage,
    input: {
      version: string;
      effectiveDate: string;
      status: LegalPage["status"];
      sections: LegalSection[];
    },
  ) => {
    const today = new Date().toISOString();
    demoStore.legal.update(page.id, {
      version: input.version,
      effectiveDate: input.effectiveDate ? input.effectiveDate : null,
      status: input.status,
      lastUpdated: today,
      sections: input.sections,
    });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "legal-content-manager",
      action: input.status === "published" ? "legal.published" : "legal.updated",
      resourceType: "legal-page",
      resourceId: page.id,
      description: `Updated ${titleCase(page.type)} legal page (v${input.version}) → ${titleCase(input.status)}`,
    });
    toast({
      title: "Legal page saved",
      description: "Saved. Set the page to Published to show it on the public site.",
      intent: "success",
    });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Legal Pages"
        description="Manage privacy, cookies, terms and campaign-terms content. Publishing is always an explicit, reviewed step — never automatic."
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Legal Pages" },
        ]}
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          Unverified placeholders (e.g. “[Legal company name to be added]”) are preserved as-is until
          you replace them.
        </p>
      </div>

      {editingPage ? (
        <LegalPageEditor
          page={editingPage}
          canEdit={canEdit}
          onBack={() => setEditingId(null)}
          onSave={(input) => handleSave(editingPage, input)}
        />
      ) : (
        <>
          <section aria-label="Legal metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <AdminMetricCard label="Legal pages" value={pages.length} icon="Scale" />
            <AdminMetricCard
              label="Published"
              value={publishedCount}
              icon="Globe"
              intent="success"
            />
            <AdminMetricCard label="Drafts" value={draftCount} icon="FileEdit" />
          </section>

          {!ready ? (
            <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
              Loading legal pages…
            </div>
          ) : failed ? (
            <ErrorState
              title="Couldn't load legal pages"
              description="The legal pages failed to load. Try again."
              action={{ label: "Retry", onClick: load }}
            />
          ) : pages.length === 0 ? (
            <EmptyState
              title="No legal pages"
              description="Legal pages are seeded with the platform."
              icon="Scale"
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border rounded-[16px] border border-border bg-canvas shadow-card">
              {pages.map((page) => (
                <li
                  key={page.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text-primary">{titleCase(page.type)}</p>
                      <StatusBadge group="publishing" value={page.status} />
                    </div>
                    <p className="mt-1 text-small text-text-secondary">
                      Version {page.version} · {page.sections.length}{" "}
                      {page.sections.length === 1 ? "section" : "sections"} · Updated{" "}
                      {formatDate(page.lastUpdated)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={publicRouteFor(page.type)} target="_blank" rel="noreferrer">
                        <Icon name="ExternalLink" className="size-4" aria-hidden />
                        View public
                      </Link>
                    </Button>
                    <PermissionGate
                      user={user}
                      permission={PERMISSIONS.LEGAL_EDIT}
                      fallback={
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(page.id)}
                          aria-label={`View ${titleCase(page.type)}`}
                        >
                          <Icon name="Eye" className="size-4" aria-hidden />
                          View
                        </Button>
                      }
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(page.id)}
                        aria-label={`Edit ${titleCase(page.type)}`}
                      >
                        <Icon name="Pencil" className="size-4" aria-hidden />
                        Edit
                      </Button>
                    </PermissionGate>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
