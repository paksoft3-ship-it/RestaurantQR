"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { LOCALE_META } from "@/lib/i18n/locales";
import type { Branding, Restaurant } from "@/domain/entities";
import { SETUP_STATUSES } from "@/domain/enums";
import { AdminSection } from "@/components/admin/admin-section";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { PreviewPanel } from "@/components/admin/preview-panel";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ConfirmKind = "disable" | "archive" | null;

function setupProgress(restaurant: Restaurant): number {
  const idx = SETUP_STATUSES.indexOf(restaurant.setupStatus);
  return Math.round(((idx + 1) / SETUP_STATUSES.length) * 100);
}

export default function RestaurantWorkspacePage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [ready, setReady] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmKind>(null);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setBranding(demoStore.getBranding(id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  if (ready && !restaurant) {
    return (
      <EmptyState
        title="Restaurant not found"
        description="This restaurant may have been removed or the link is incorrect."
        icon="Store"
      >
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

  const progress = setupProgress(restaurant);
  const attention: string[] = [];
  if (restaurant.setupStatus === "not-started") attention.push("Setup has not started.");
  if (restaurant.publishingStatus === "in-review") attention.push("Publishing is awaiting review.");
  if (restaurant.publishingStatus === "changes-pending") attention.push("Unpublished changes exist.");
  if ((branding?.readiness ?? 0) < 80) attention.push("Branding is not yet ready.");

  const handleConfirm = () => {
    if (!confirm) return;
    const patch =
      confirm === "archive"
        ? { publishingStatus: "archived" as const }
        : { operationalStatus: "disabled" as const };
    demoStore.updateRestaurant(id, patch);
    toast({
      title: confirm === "archive" ? "Restaurant archived" : "Restaurant disabled",
      description: "Updated. Nothing was published.",
      intent: "success",
    });
    setConfirm(null);
  };

  const colors = branding?.colors;

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader
        restaurant={restaurant}
        actions={
          <>
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.admin.restaurantGeneral(id)}>
                <Icon name="Pencil" className="size-4" aria-hidden />
                Edit general
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.admin.restaurantBranding(id)}>
                <Icon name="Palette" className="size-4" aria-hidden />
                Branding
              </Link>
            </Button>
          </>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small text-text-secondary">Setup progress</p>
              <p className="mt-1 font-display text-h2 text-text-primary">{progress}%</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small text-text-secondary">Requires attention</p>
              <p className="mt-1 font-display text-h2 text-text-primary">{attention.length}</p>
              <p className="mt-2 text-xs text-text-secondary">items</p>
            </div>
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small text-text-secondary">Readiness</p>
              <p className="mt-1 font-display text-h2 text-text-primary">
                {branding?.readiness ?? 0}%
              </p>
              <p className="mt-2 text-xs text-text-secondary">brand readiness</p>
            </div>
          </div>

          {attention.length > 0 ? (
            <AdminSection title="Requires attention" icon="AlertTriangle">
              <ul className="flex flex-col gap-2">
                {attention.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-small text-text-primary">
                    <Icon name="Dot" className="size-5 text-warning" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </AdminSection>
          ) : null}

          {/* Publishing workflow */}
          <AdminSection title="Publishing workflow" icon="GitPullRequest">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge group="publishing" value={restaurant.publishingStatus} />
              <span className="text-small text-text-secondary">
                Publishing is a separate, reviewed step. Editing here never auto-publishes.
              </span>
            </div>
          </AdminSection>

          {/* Info + contact */}
          <AdminSection title="Information" icon="Info">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Legal name" value={restaurant.legalName ?? "To be confirmed"} />
              <Detail label="Slug" value={restaurant.slug} />
              <Detail
                label="Tagline"
                value={resolveText(restaurant.tagline) || "To be added"}
              />
              <Detail
                label="Public description"
                value={resolveText(restaurant.descriptions.public) || "To be added"}
                full
              />
              <Detail label="Cuisines" value={restaurant.cuisines.join(", ") || "—"} />
              <Detail
                label="Service models"
                value={restaurant.serviceModels.map(titleCase).join(", ")}
              />
              <Detail label="Structure" value={titleCase(restaurant.structureType)} />
              <Detail label="Locations" value={String(restaurant.numberOfLocations)} />
            </dl>
          </AdminSection>

          {/* Illustrative demo summaries */}
          <AdminSection
            title="Operational summaries"
            description="Illustrative demo figures — wired to live data in Part 2."
            icon="LayoutGrid"
            actions={<DemoTag />}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DemoStat label="Menu items" value="24" icon="BookOpen" />
              <DemoStat label="QR codes" value="2" icon="QrCode" />
              <DemoStat label="NFC products" value="2" icon="Nfc" />
              <DemoStat label="Campaigns" value="1" icon="Megaphone" />
              <DemoStat label="Scans (30d)" value="1,420" icon="ScanLine" />
              <DemoStat label="Menu views (30d)" value="3,180" icon="Eye" />
            </div>
          </AdminSection>

          <AdminSection title="Opening hours" icon="Clock" actions={<DemoTag />}>
            <p className="text-small text-text-secondary">
              A weekly schedule appears here once configured. Drafts start with no public hours.
            </p>
          </AdminSection>

          <AdminSection title="Recent activity" icon="ScrollText">
            <ActivityFeed
              items={[]}
              emptyLabel="No activity recorded for this restaurant yet."
            />
          </AdminSection>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <AdminSection title="Mobile preview" icon="Smartphone">
            <PreviewPanel colors={colors} label={`${restaurant.displayName} preview`}>
              <div
                className="flex h-full flex-col gap-3 p-4"
                style={{ background: colors?.surface ?? "#F8FAFC", color: colors?.text ?? "#111827" }}
              >
                <div
                  className="rounded-[12px] p-3 text-white"
                  style={{ background: colors?.primary ?? "#F04424" }}
                >
                  <p className="text-sm font-bold">{restaurant.displayName}</p>
                  <p className="text-xs opacity-90">{resolveText(restaurant.tagline)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Call Order", "Pick Your Meal", "Online Order", "Visit Us"].map((a) => (
                    <div
                      key={a}
                      className="rounded-[10px] border p-2 text-center text-[11px] font-semibold"
                      style={{ borderColor: colors?.primary ?? "#F04424" }}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            </PreviewPanel>
          </AdminSection>

          <AdminSection title="Languages" icon="Languages">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                {LOCALE_META[restaurant.primaryLanguage].label} (primary)
              </span>
              {restaurant.additionalLanguages.map((l) => (
                <span
                  key={l}
                  className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary"
                >
                  {LOCALE_META[l].label}
                </span>
              ))}
            </div>
          </AdminSection>

          <AdminSection title="Teams" icon="Users">
            {restaurant.assignedTeams.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {restaurant.assignedTeams.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-small text-text-secondary">No teams assigned.</p>
            )}
          </AdminSection>

          <AdminSection title="Internal notes" icon="Lock">
            <p className="text-small text-text-secondary">
              {restaurant.internalNotes ?? "No internal notes."}
            </p>
          </AdminSection>

          <AdminSection title="Quick actions" icon="Zap">
            <div className="flex flex-col gap-2">
              <Button asChild variant="secondary" className="justify-start">
                <Link href={routes.admin.restaurantGeneral(id)}>
                  <Icon name="Pencil" className="size-4" aria-hidden />
                  Edit general information
                </Link>
              </Button>
              <Button asChild variant="secondary" className="justify-start">
                <Link href={routes.admin.restaurantBranding(id)}>
                  <Icon name="Palette" className="size-4" aria-hidden />
                  Edit branding
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                disabled={restaurant.operationalStatus === "disabled"}
                onClick={() => setConfirm("disable")}
              >
                <Icon name="Ban" className="size-4" aria-hidden />
                Disable
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                disabled={restaurant.publishingStatus === "archived"}
                onClick={() => setConfirm("archive")}
              >
                <Icon name="Archive" className="size-4" aria-hidden />
                Archive
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              Updated {formatDate(restaurant.updatedAt)}
            </p>
          </AdminSection>
        </div>
      </div>

      <ConfirmationDialog
        open={confirm !== null}
        title={confirm === "archive" ? "Archive restaurant?" : "Disable restaurant?"}
        description={
          confirm === "archive"
            ? "It will be hidden from active lists. This is reversible and does not delete data."
            : "It will be marked disabled. Public visibility is unaffected until you publish changes."
        }
        confirmLabel={confirm === "archive" ? "Archive" : "Disable"}
        intent="danger"
        icon={confirm === "archive" ? "Archive" : "Ban"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="text-xs font-medium text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-small text-text-primary">{value}</dd>
    </div>
  );
}

function DemoTag() {
  return (
    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
      Demo Data
    </span>
  );
}

function DemoStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[12px] border border-border bg-surface p-3">
      <span className="flex size-7 items-center justify-center rounded-[8px] bg-surface-warm text-primary">
        <Icon name={icon} className="size-4" aria-hidden />
      </span>
      <p className="font-display text-h3 text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}
