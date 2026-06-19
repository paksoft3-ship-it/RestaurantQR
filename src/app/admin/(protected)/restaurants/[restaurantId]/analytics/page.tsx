"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import type { Restaurant } from "@/domain/entities";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { AdminSection } from "@/components/admin/admin-section";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { InteractionAnalyticsChart } from "@/components/charts/interaction-analytics-chart";
import { EmptyState } from "@/components/shared/states";
import { WidgetBoundary } from "@/components/shared/error-boundary";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";

/** Deterministic hash so a restaurant always renders the same illustrative numbers. */
function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

interface DemoAnalytics {
  scans: number;
  taps: number;
  menuViews: number;
  actionClicks: number;
  series: { label: string; value: number }[];
  topProducts: { name: string; views: number }[];
  actionBreakdown: { label: string; value: number }[];
  qr: number;
  nfc: number;
}

function buildDemoAnalytics(id: string): DemoAnalytics {
  const seed = hashSeed(id);
  const pick = (offset: number, min: number, span: number) =>
    min + (Math.floor(seed / Math.pow(7, offset + 1)) % span);

  const scans = 400 + pick(0, 0, 1800);
  const taps = 120 + pick(1, 0, 900);
  const menuViews = scans + taps + 300 + pick(2, 0, 1200);
  const actionClicks = 80 + pick(3, 0, 700);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const series = months.map((label, i) => ({
    label,
    value: 200 + pick(4 + i, 0, 1400),
  }));

  const productNames = [
    "Margherita Pizza",
    "Pepperoni Pizza",
    "Garlic Bread",
    "House Salad",
    "Tiramisu",
  ];
  const topProducts = productNames
    .map((name, i) => ({ name, views: 60 + pick(10 + i, 0, 700) }))
    .sort((a, b) => b.views - a.views);

  const actionBreakdown = [
    { label: "Call Order", value: 30 + pick(20, 0, 300) },
    { label: "Pick Your Meal", value: 30 + pick(21, 0, 300) },
    { label: "Online Order", value: 30 + pick(22, 0, 300) },
    { label: "Visit Us", value: 30 + pick(23, 0, 300) },
  ];

  return {
    scans,
    taps,
    menuViews,
    actionClicks,
    series,
    topProducts,
    actionBreakdown,
    qr: scans,
    nfc: taps,
  };
}

/** Contain widget failures so one error never blanks the analytics page. */
function SafeWidget({ label, children }: { label: string; children: React.ReactNode }) {
  return <WidgetBoundary label={label}>{children}</WidgetBoundary>;
}

const DemoTag = () => (
  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
    Illustrative Demo Data
  </span>
);

export default function RestaurantAnalyticsPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    window.addEventListener(DEMO_STORE_EVENT, load);
    return () => window.removeEventListener(DEMO_STORE_EVENT, load);
  }, [load]);

  const analytics = useMemo(() => buildDemoAnalytics(id), [id]);

  const actionTotal = analytics.actionBreakdown.reduce((s, a) => s + a.value, 0);
  const channelTotal = analytics.qr + analytics.nfc;
  const qrPct = channelTotal ? Math.round((analytics.qr / channelTotal) * 100) : 0;
  const nfcPct = 100 - qrPct;

  if (ready && !restaurant) {
    return (
      <EmptyState
        title="Restaurant not found"
        description="This restaurant may have been removed."
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
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader restaurant={restaurant} />
      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-3 rounded-[16px] border border-accent/40 bg-accent/10 p-4">
        <Icon name="FlaskConical" className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
        <p className="text-small text-text-secondary">
          Every figure on this page is <strong>Illustrative Demo Data</strong>, derived
          deterministically from the restaurant ID. It reflects aggregated, privacy-aware
          interactions only — no customer identities, confirmed orders or revenue.
        </p>
      </div>

      <section
        aria-label="Key interaction metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <AdminMetricCard label="QR scans" value={analytics.scans.toLocaleString()} icon="QrCode" demo />
        <AdminMetricCard label="NFC taps" value={analytics.taps.toLocaleString()} icon="Nfc" demo />
        <AdminMetricCard
          label="Menu views"
          value={analytics.menuViews.toLocaleString()}
          icon="BookOpen"
          intent="primary"
          demo
        />
        <AdminMetricCard
          label="Action clicks"
          value={analytics.actionClicks.toLocaleString()}
          icon="MousePointerClick"
          intent="success"
          demo
        />
      </section>

      <AdminSection
        title="Engagement trend"
        icon="BarChart3"
        description="Illustrative monthly interaction volume."
        actions={<DemoTag />}
      >
        <SafeWidget label="the trend chart">
          <InteractionAnalyticsChart series={analytics.series} title="Monthly interactions" />
        </SafeWidget>
      </AdminSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminSection
          title="Top products"
          icon="Flame"
          description="Most-viewed menu items."
          actions={<DemoTag />}
        >
          <SafeWidget label="top products">
            <table className="w-full text-left text-small">
              <caption className="sr-only">Illustrative most-viewed products.</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-4 font-semibold text-text-secondary">
                    Product
                  </th>
                  <th scope="col" className="py-2 font-semibold text-text-secondary">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((p) => (
                  <tr key={p.name} className="border-b border-border last:border-0">
                    <th scope="row" className="py-2 pr-4 font-normal text-text-primary">
                      {p.name}
                    </th>
                    <td className="py-2 text-text-primary">{p.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SafeWidget>
        </AdminSection>

        <AdminSection
          title="Customer action breakdown"
          icon="MousePointerClick"
          description="Clicks across the four primary actions."
          actions={<DemoTag />}
        >
          <SafeWidget label="action breakdown">
            <ul className="flex flex-col gap-3">
              {analytics.actionBreakdown.map((a) => {
                const pct = actionTotal ? Math.round((a.value / actionTotal) * 100) : 0;
                return (
                  <li key={a.label}>
                    <div className="flex items-center justify-between gap-2 text-small">
                      <span className="text-text-primary">{a.label}</span>
                      <span className="text-text-secondary">
                        {a.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                      role="presentation"
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-text-tertiary">
              Click counts reflect taps on actions, not confirmed calls, visits or orders.
            </p>
          </SafeWidget>
        </AdminSection>
      </div>

      <AdminSection
        title="QR vs NFC split"
        icon="Split"
        description="Share of interactions by entry channel."
        actions={<DemoTag />}
      >
        <SafeWidget label="the channel split">
          <div className="flex flex-col gap-4">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-surface-muted"
              role="img"
              aria-label={`QR ${qrPct} percent, NFC ${nfcPct} percent of interactions.`}
            >
              <div className="h-full bg-primary" style={{ width: `${qrPct}%` }} />
              <div className="h-full bg-accent" style={{ width: `${nfcPct}%` }} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary" aria-hidden />
                <div>
                  <dt className="text-small text-text-secondary">QR scans</dt>
                  <dd className="font-display text-h3 text-text-primary">
                    {analytics.qr.toLocaleString()} <span className="text-small text-text-secondary">({qrPct}%)</span>
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-accent" aria-hidden />
                <div>
                  <dt className="text-small text-text-secondary">NFC taps</dt>
                  <dd className="font-display text-h3 text-text-primary">
                    {analytics.nfc.toLocaleString()} <span className="text-small text-text-secondary">({nfcPct}%)</span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </SafeWidget>
      </AdminSection>

      <p className="text-center text-xs text-text-tertiary">
        All analytics on this page are illustrative demo data and are not connected to a live data
        source.
      </p>
    </div>
  );
}
