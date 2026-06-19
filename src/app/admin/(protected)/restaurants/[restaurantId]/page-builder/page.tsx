"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import type { Restaurant } from "@/domain/entities";
import { PERMISSIONS } from "@/domain/permissions";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { PreviewPanel } from "@/components/admin/preview-panel";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Approved, controlled homepage section inventory — no freeform canvas. */
type SectionKey =
  | "hero"
  | "four-actions"
  | "featured-menu"
  | "campaign-banner"
  | "opening-hours"
  | "location"
  | "social";

interface SectionDef {
  key: SectionKey;
  label: string;
  description: string;
  icon: string;
  source: string;
}

interface SectionState {
  key: SectionKey;
  enabled: boolean;
}

const SECTION_LIBRARY: Record<SectionKey, SectionDef> = {
  hero: {
    key: "hero",
    label: "Hero",
    description: "Restaurant name, tagline and cover image.",
    icon: "Image",
    source: "General + Branding",
  },
  "four-actions": {
    key: "four-actions",
    label: "Four primary actions",
    description: "Call Order, Pick Your Meal, Online Order with Pay, Visit Us.",
    icon: "MousePointerClick",
    source: "Customer Actions",
  },
  "featured-menu": {
    key: "featured-menu",
    label: "Featured menu",
    description: "Highlighted products from the digital menu.",
    icon: "BookOpen",
    source: "Menu",
  },
  "campaign-banner": {
    key: "campaign-banner",
    label: "Campaign banner",
    description: "Active campaign promotion strip.",
    icon: "Megaphone",
    source: "Campaigns",
  },
  "opening-hours": {
    key: "opening-hours",
    label: "Opening hours",
    description: "Weekly hours and open/closed status.",
    icon: "Clock",
    source: "Opening Hours",
  },
  location: {
    key: "location",
    label: "Location",
    description: "Address, map link and directions.",
    icon: "MapPin",
    source: "Contact & Location",
  },
  social: {
    key: "social",
    label: "Social",
    description: "Links to social profiles.",
    icon: "Share2",
    source: "Contact & Location",
  },
};

const DEFAULT_ORDER: SectionState[] = [
  { key: "hero", enabled: true },
  { key: "four-actions", enabled: true },
  { key: "featured-menu", enabled: true },
  { key: "campaign-banner", enabled: true },
  { key: "opening-hours", enabled: true },
  { key: "location", enabled: true },
  { key: "social", enabled: false },
];

/** Which sections have a usable source in the demo store. */
function sourceAvailability(restaurantId: string): Record<SectionKey, boolean> {
  const actions = demoStore.customerActions.where((a) => a.restaurantId === restaurantId);
  const products = demoStore.products.where((p) => p.restaurantId === restaurantId);
  const campaigns = demoStore.campaigns.where((c) => c.restaurantId === restaurantId);
  const hours = demoStore.getOpeningHours(restaurantId);
  const location = demoStore.locations.where((l) => l.restaurantId === restaurantId)[0];
  return {
    hero: true,
    "four-actions": actions.some((a) => a.enabled),
    "featured-menu": products.length > 0,
    "campaign-banner": campaigns.some((c) => c.status === "active"),
    "opening-hours": hours.length > 0,
    location: Boolean(location?.address),
    social: actions.some((a) => a.type === "instagram" && a.enabled),
  };
}

export default function PageBuilderPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();
  const user = useAdminUser();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ready, setReady] = useState(false);
  const [sections, setSections] = useState<SectionState[]>(DEFAULT_ORDER);
  const [availability, setAvailability] = useState<Record<SectionKey, boolean> | null>(null);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    setRestaurant(r);
    setAvailability(sourceAvailability(id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => {
      // Source availability can change without touching the draft order.
      setAvailability(sourceAvailability(id));
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load, id]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    setDirty(true);
  };

  const toggle = (key: SectionKey) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));
    setDirty(true);
  };

  const enabledSections = useMemo(() => sections.filter((s) => s.enabled), [sections]);

  const brokenCount = useMemo(() => {
    if (!availability) return 0;
    return enabledSections.filter((s) => !availability[s.key]).length;
  }, [enabledSections, availability]);

  const saveDraft = () => {
    // No dedicated entity for section config — this is a simulated draft.
    demoStore.recordActivity({
      actorId: user?.id ?? "unknown",
      actorRole: user?.role ?? "support-team",
      action: "page-builder.save-draft",
      resourceType: "restaurant-page",
      resourceId: id,
      description: `Saved homepage section draft (${enabledSections.length} sections) for ${
        restaurant?.displayName ?? id
      }.`,
      metadata: { order: sections.map((s) => `${s.key}:${s.enabled ? "on" : "off"}`).join(",") },
    });
    toast({
      title: "Section layout draft saved",
      description: "Simulated draft only — sections are not published and nothing went live.",
      intent: "success",
    });
    setDirty(false);
  };

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

  const breadcrumb = [
    { label: "Admin", href: routes.admin.dashboard() },
    { label: "Restaurants", href: routes.admin.restaurants() },
    { label: restaurant.displayName, href: routes.admin.restaurant(id) },
    { label: "Page Builder" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader restaurant={restaurant} breadcrumb={breadcrumb} />
      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Managed section configurator — arrange approved homepage sections only. No raw HTML, code or
          freeform layout. This is a <strong>simulated draft</strong>; it never auto-publishes.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection
            title="Homepage sections"
            description="Enable, disable and reorder approved sections. Keyboard-operable controls."
            icon="LayoutTemplate"
          >
            <ol className="flex flex-col gap-3">
              {sections.map((section, index) => {
                const def = SECTION_LIBRARY[section.key];
                const broken = section.enabled && availability ? !availability[section.key] : false;
                return (
                  <li
                    key={section.key}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-[12px] border bg-surface p-4",
                      section.enabled ? "border-border" : "border-dashed border-border opacity-70",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
                      <Icon name={def.icon} className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text-primary">{def.label}</p>
                        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-tertiary">
                          {def.source}
                        </span>
                        {!section.enabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                            <Icon name="EyeOff" className="size-3" aria-hidden /> Hidden
                          </span>
                        ) : null}
                        {broken ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                            <Icon name="AlertTriangle" className="size-3" aria-hidden /> Source missing
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-text-secondary">{def.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${def.label} up`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <Icon name="ChevronUp" className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${def.label} down`}
                        disabled={index === sections.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <Icon name="ChevronDown" className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant={section.enabled ? "outline" : "primary"}
                        size="sm"
                        aria-pressed={section.enabled}
                        onClick={() => toggle(section.key)}
                      >
                        <Icon name={section.enabled ? "Eye" : "EyeOff"} className="size-4" aria-hidden />
                        {section.enabled ? "Shown" : "Hidden"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
            {brokenCount > 0 ? (
              <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {brokenCount} enabled section(s) reference a missing source. Add the source content or
                  hide the section before publishing.
                </span>
              </div>
            ) : null}
          </AdminSection>
        </div>

        {/* Live preview + readiness */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <PreviewPanel label="Homepage preview">
              <div className="flex flex-col gap-2 p-3">
                {enabledSections.length === 0 ? (
                  <p className="py-8 text-center text-xs text-text-tertiary">No sections enabled.</p>
                ) : (
                  enabledSections.map((s) => {
                    const def = SECTION_LIBRARY[s.key];
                    const broken = availability ? !availability[s.key] : false;
                    return (
                      <div
                        key={s.key}
                        className={cn(
                          "flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-xs",
                          broken
                            ? "border-warning/40 bg-warning/5 text-warning"
                            : "border-border bg-surface text-text-primary",
                        )}
                      >
                        <Icon name={def.icon} className="size-4 shrink-0" aria-hidden />
                        <span className="font-medium">{def.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </PreviewPanel>

            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Readiness checklist</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs">
                <ReadyRow ok={enabledSections.some((s) => s.key === "hero")} label="Hero enabled" />
                <ReadyRow ok={enabledSections.some((s) => s.key === "four-actions")} label="Primary actions enabled" />
                <ReadyRow ok={brokenCount === 0} label="No broken sources" />
              </ul>
              <p className="mt-3 text-xs text-text-tertiary">Draft is not published.</p>
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          dirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved draft changes
            </span>
          ) : (
            <span>Draft layout — not published.</span>
          )
        }
      >
        <Button asChild variant="ghost">
          <Link href={routes.admin.restaurant(id)}>Preview</Link>
        </Button>
        <PermissionGate
          user={user}
          permission={PERMISSIONS.RESTAURANT_EDIT}
          fallback={<span className="text-xs text-text-tertiary">View only — saving needs edit access.</span>}
        >
          <Button type="button" onClick={saveDraft}>
            Save Draft
          </Button>
        </PermissionGate>
      </StickyActionBar>
    </div>
  );
}

function ReadyRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Icon
        name={ok ? "CheckCircle2" : "Circle"}
        className={ok ? "size-3.5 text-success" : "size-3.5 text-text-tertiary"}
        aria-hidden
      />
      <span className={ok ? "text-text-primary" : "text-text-secondary"}>{label}</span>
      <span className="sr-only">{ok ? "complete" : "incomplete"}</span>
    </li>
  );
}
