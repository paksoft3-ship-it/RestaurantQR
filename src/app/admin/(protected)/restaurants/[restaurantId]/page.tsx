"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { formatDate, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { LOCALE_META } from "@/lib/i18n/locales";
import type { ActivityRecord, Branding, OpeningHours, Restaurant } from "@/domain/entities";
import { DAYS_OF_WEEK, SETUP_STATUSES } from "@/domain/enums";
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

type ConfirmKind = "disable" | "archive" | "publish" | "unpublish" | null;

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
  const [counts, setCounts] = useState({ products: 0, qr: 0, nfc: 0, campaigns: 0, media: 0, actions: 0 });
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [hours, setHours] = useState<OpeningHours[]>([]);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setBranding(demoStore.getBranding(id));
    setCounts({
      products: demoStore.products.where((p) => p.restaurantId === id).length,
      qr: demoStore.qr.where((q) => q.restaurantId === id).length,
      nfc: demoStore.nfc.where((n) => n.restaurantId === id).length,
      campaigns: demoStore.campaigns.where((c) => c.restaurantId === id).length,
      media: demoStore.media.where((m) => m.restaurantId === id).length,
      actions: demoStore.customerActions.where((a) => a.restaurantId === id && a.enabled).length,
    });
    setActivity(
      demoStore.audit
        .where((a) => a.resourceId === id)
        .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
        .slice(0, 6),
    );
    setHours(demoStore.getOpeningHours(id));
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
        : confirm === "disable"
          ? { operationalStatus: "disabled" as const }
          : confirm === "publish"
            ? { publishingStatus: "published" as const }
            : { publishingStatus: "draft" as const }; // unpublish
    demoStore.updateRestaurant(id, patch);
    const titles: Record<Exclude<ConfirmKind, null>, string> = {
      archive: "Restaurant archived",
      disable: "Restaurant disabled",
      publish: "Restaurant published",
      unpublish: "Restaurant unpublished",
    };
    const descriptions: Record<Exclude<ConfirmKind, null>, string> = {
      archive: "Updated. Nothing was published.",
      disable: "Updated. Nothing was published.",
      publish: "It is now live on its public page.",
      unpublish: "It is hidden from the public again.",
    };
    toast({ title: titles[confirm], description: descriptions[confirm], intent: "success" });
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
                {restaurant.publishingStatus === "published"
                  ? "Live on its public page. Editing never changes the live page until you re-publish."
                  : "Hidden from the public until you publish. Editing here never auto-publishes."}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {restaurant.publishingStatus === "published" ? (
                <Button variant="outline" onClick={() => setConfirm("unpublish")}>
                  <Icon name="EyeOff" className="size-4" aria-hidden />
                  Unpublish
                </Button>
              ) : (
                <Button
                  disabled={restaurant.publishingStatus === "archived"}
                  onClick={() => setConfirm("publish")}
                >
                  <Icon name="Globe" className="size-4" aria-hidden />
                  Publish
                </Button>
              )}
              <Button asChild variant="ghost">
                <a
                  href={routes.restaurant.home(restaurant.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="ExternalLink" className="size-4" aria-hidden />
                  View public page
                </a>
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              You can preview the public page any time while logged in — visitors only see it once
              it’s published.
            </p>
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

          {/* Live operational summaries (counts from this restaurant's data). */}
          <AdminSection
            title="Operational summaries"
            description="Live counts from this restaurant's configured content."
            icon="LayoutGrid"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DemoStat label="Menu items" value={String(counts.products)} icon="BookOpen" />
              <DemoStat label="QR codes" value={String(counts.qr)} icon="QrCode" />
              <DemoStat label="NFC products" value={String(counts.nfc)} icon="Nfc" />
              <DemoStat label="Campaigns" value={String(counts.campaigns)} icon="Megaphone" />
              <DemoStat label="Enabled actions" value={String(counts.actions)} icon="MousePointerClick" />
              <DemoStat label="Media assets" value={String(counts.media)} icon="Image" />
            </div>
          </AdminSection>

          <AdminSection
            title="Opening hours"
            icon="Clock"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href={routes.admin.restaurantHours(id)}>Edit</Link>
              </Button>
            }
          >
            {hours.length === 0 ? (
              <p className="text-small text-text-secondary">
                No hours configured yet.{" "}
                <Link href={routes.admin.restaurantHours(id)} className="font-semibold text-primary hover:underline">
                  Set opening hours
                </Link>
                .
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-small">
                {DAYS_OF_WEEK.map((day) => {
                  const entry = hours.find((h) => h.day === day);
                  const open = entry?.status === "open" && entry.periods.length > 0;
                  return (
                    <li key={day} className="flex items-center justify-between gap-3">
                      <span className="font-medium capitalize text-text-primary">{day}</span>
                      <span className={open ? "text-text-secondary" : "text-text-tertiary"}>
                        {open
                          ? entry!.periods.map((p) => `${p.open}–${p.close}`).join(", ")
                          : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminSection>

          <AdminSection title="Recent activity" icon="ScrollText">
            <ActivityFeed
              items={activity}
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
        title={
          confirm === "archive"
            ? "Archive restaurant?"
            : confirm === "disable"
              ? "Disable restaurant?"
              : confirm === "publish"
                ? "Publish restaurant?"
                : "Unpublish restaurant?"
        }
        description={
          confirm === "archive"
            ? "It will be hidden from active lists. This is reversible and does not delete data."
            : confirm === "disable"
              ? "It will be marked disabled. Public visibility is unaffected until you publish changes."
              : confirm === "publish"
                ? "This makes the restaurant’s public page live for everyone at its public URL."
                : "This hides the restaurant’s public page from visitors again. You can re-publish anytime."
        }
        confirmLabel={
          confirm === "archive"
            ? "Archive"
            : confirm === "disable"
              ? "Disable"
              : confirm === "publish"
                ? "Publish"
                : "Unpublish"
        }
        intent={confirm === "publish" ? "primary" : "danger"}
        icon={
          confirm === "archive"
            ? "Archive"
            : confirm === "disable"
              ? "Ban"
              : confirm === "publish"
                ? "Globe"
                : "EyeOff"
        }
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
