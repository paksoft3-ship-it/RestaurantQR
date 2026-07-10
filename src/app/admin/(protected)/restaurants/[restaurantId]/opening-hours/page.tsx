"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { openingHoursSchema } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import type { OpeningHours, OpeningPeriod, Restaurant } from "@/domain/entities";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const TIME_RE = /^\d{2}:\d{2}$/;

function emptyDays(): OpeningHours[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    status: "open" as const,
    periods: [{ open: "09:00", close: "22:00" }],
    specialHours: null,
  }));
}

function normalize(existing: OpeningHours[]): OpeningHours[] {
  if (existing.length === 0) return emptyDays();
  // Keep canonical day order.
  return DAYS_OF_WEEK.map((day) => {
    const found = existing.find((d) => d.day === day);
    return (
      found ?? { day, status: "closed" as const, periods: [], specialHours: null }
    );
  });
}

/** Detect overlapping / inverted periods for a day. */
function dayHasError(day: OpeningHours): boolean {
  if (day.status === "closed") return false;
  if (day.periods.length === 0) return true;
  const sorted = [...day.periods].sort((a, b) => a.open.localeCompare(b.open));
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    if (!TIME_RE.test(p.open) || !TIME_RE.test(p.close)) return true;
    if (p.close <= p.open) return true;
    if (i > 0 && p.open < sorted[i - 1].close) return true;
  }
  return false;
}

export default function OpeningHoursPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();
  const user = useAdminUser();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [days, setDays] = useState<OpeningHours[]>([]);
  const [timezone, setTimezone] = useState("");
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    const hours = normalize(demoStore.getOpeningHours(id));
    setRestaurant(r);
    setDays(hours);
    setTimezone(hours[0]?.timezone ?? "America/Chicago");
    setReady(true);
    setDirty(false);
  }, [id]);

  const dirtyRef = useRef(false);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    load();
    const handler = () => {
      if (!dirtyRef.current) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  const mutate = (next: OpeningHours[]) => {
    setDays(next);
    setDirty(true);
  };

  const setStatus = (index: number, status: "open" | "closed") => {
    mutate(
      days.map((d, i) =>
        i === index
          ? {
              ...d,
              status,
              periods: status === "open" && d.periods.length === 0 ? [{ open: "09:00", close: "22:00" }] : d.periods,
            }
          : d,
      ),
    );
  };

  const setPeriod = (dayIndex: number, periodIndex: number, patch: Partial<OpeningPeriod>) => {
    mutate(
      days.map((d, i) =>
        i === dayIndex
          ? { ...d, periods: d.periods.map((p, pi) => (pi === periodIndex ? { ...p, ...patch } : p)) }
          : d,
      ),
    );
  };

  const addPeriod = (dayIndex: number) => {
    mutate(
      days.map((d, i) =>
        i === dayIndex ? { ...d, periods: [...d.periods, { open: "17:00", close: "22:00" }] } : d,
      ),
    );
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    mutate(
      days.map((d, i) =>
        i === dayIndex ? { ...d, periods: d.periods.filter((_, pi) => pi !== periodIndex) } : d,
      ),
    );
  };

  const setSpecial = (dayIndex: number, value: string) => {
    mutate(days.map((d, i) => (i === dayIndex ? { ...d, specialHours: value || null } : d)));
  };

  const copyMonToWeekdays = () => {
    const monday = days.find((d) => d.day === "monday");
    if (!monday) return;
    mutate(
      days.map((d) =>
        ["tuesday", "wednesday", "thursday", "friday"].includes(d.day)
          ? { ...d, status: monday.status, periods: monday.periods.map((p) => ({ ...p })) }
          : d,
      ),
    );
    toast({ title: "Copied Monday to weekdays", intent: "info" });
  };

  const validationErrors = useMemo(() => days.filter(dayHasError).map((d) => d.day), [days]);

  const save = () => {
    const payload: OpeningHours[] = days.map((d) => ({
      ...d,
      timezone: timezone || null,
      specialHours: d.specialHours ?? null,
    }));

    // Schema expects specialHours as string | undefined | ""; map nulls before validating.
    const parsed = openingHoursSchema.safeParse({
      days: payload.map((d) => ({
        day: d.day,
        status: d.status,
        periods: d.periods,
        specialHours: d.specialHours ?? "",
      })),
    });
    if (!parsed.success || validationErrors.length > 0) {
      toast({
        title: "Schedule has issues",
        description: "Fix invalid or overlapping time ranges before saving.",
        intent: "danger",
      });
      return;
    }

    demoStore.setOpeningHours(id, payload);
    demoStore.recordActivity({
      actorId: user?.id ?? "unknown",
      actorRole: user?.role ?? "support-team",
      action: "opening-hours.save-draft",
      resourceType: "opening-hours",
      resourceId: id,
      description: `Saved opening-hours draft for ${restaurant?.displayName ?? id}.`,
    });

    toast({
      title: "Opening hours draft saved",
      description: "Stored as a draft. Public hours are unchanged until published.",
      intent: "success",
    });
    load();
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
    { label: "Opening Hours" },
  ];

  // Live open/closed status for preview (uses local time; illustrative).
  const todayName = DAYS_OF_WEEK[(new Date().getDay() + 6) % 7];
  const today = days.find((d) => d.day === todayName);
  const nowHm = new Date().toTimeString().slice(0, 5);
  const isOpenNow =
    today?.status === "open" &&
    today.periods.some((p) => TIME_RE.test(p.open) && TIME_RE.test(p.close) && p.open <= nowHm && nowHm < p.close);

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader restaurant={restaurant} breadcrumb={breadcrumb} />
      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection
            title="Location & time settings"
            description="Schedules apply in this time zone."
            icon="Globe"
          >
            <Field
              label="Operational time zone"
              htmlFor="timezone"
              hint="IANA name, e.g. America/Chicago. Required for correct open/closed status."
            >
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setDirty(true);
                }}
              />
            </Field>
            {!timezone ? (
              <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>Time-zone review required — a missing time zone makes open/closed status unreliable.</span>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection
            title="Regular weekly schedule"
            description="Per-day open/closed and time periods (split shifts supported)."
            icon="Clock"
            actions={
              <PermissionGate user={user} permission={PERMISSIONS.RESTAURANT_EDIT}>
                <Button type="button" variant="ghost" size="sm" onClick={copyMonToWeekdays}>
                  <Icon name="Copy" className="size-4" aria-hidden />
                  Copy Mon to weekdays
                </Button>
              </PermissionGate>
            }
          >
            <ul className="flex flex-col gap-3">
              {days.map((day, dayIndex) => {
                const hasError = dayHasError(day);
                return (
                  <li
                    key={day.day}
                    className="rounded-[12px] border border-border bg-surface p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex min-w-[150px] items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={day.status === "open"}
                          aria-label={`${DAY_LABELS[day.day]} open`}
                          onClick={() => setStatus(dayIndex, day.status === "open" ? "closed" : "open")}
                          className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-input-border bg-canvas transition-colors data-[on=true]:bg-primary"
                          data-on={day.status === "open"}
                        >
                          <span
                            className="inline-block size-5 translate-x-1 rounded-full bg-text-tertiary transition-transform data-[on=true]:translate-x-6 data-[on=true]:bg-white"
                            data-on={day.status === "open"}
                            aria-hidden
                          />
                        </button>
                        <span className="font-semibold text-text-primary">{DAY_LABELS[day.day]}</span>
                      </div>

                      {day.status === "closed" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-secondary">
                          <Icon name="Moon" className="size-3.5" aria-hidden /> Closed
                        </span>
                      ) : (
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          {day.periods.map((period, periodIndex) => (
                            <div key={periodIndex} className="flex flex-wrap items-center gap-2">
                              <Input
                                type="time"
                                aria-label={`${DAY_LABELS[day.day]} period ${periodIndex + 1} opens`}
                                value={period.open}
                                onChange={(e) => setPeriod(dayIndex, periodIndex, { open: e.target.value })}
                                className="h-11 w-[120px]"
                              />
                              <span className="text-text-tertiary" aria-hidden>
                                –
                              </span>
                              <Input
                                type="time"
                                aria-label={`${DAY_LABELS[day.day]} period ${periodIndex + 1} closes`}
                                value={period.close}
                                onChange={(e) => setPeriod(dayIndex, periodIndex, { close: e.target.value })}
                                className="h-11 w-[120px]"
                              />
                              {day.periods.length > 1 ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Remove period ${periodIndex + 1} from ${DAY_LABELS[day.day]}`}
                                  onClick={() => removePeriod(dayIndex, periodIndex)}
                                >
                                  <Icon name="Trash2" className="size-4" aria-hidden />
                                </Button>
                              ) : null}
                            </div>
                          ))}
                          <div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addPeriod(dayIndex)}
                            >
                              <Icon name="Plus" className="size-4" aria-hidden />
                              Add period (split shift)
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {hasError ? (
                      <p role="alert" className="mt-2 text-xs font-medium text-danger">
                        Invalid or overlapping times. Each period must have close after open and not
                        overlap another.
                      </p>
                    ) : null}

                    <div className="mt-3">
                      <Field
                        label="Special note (optional)"
                        htmlFor={`special-${day.day}`}
                        hint="Shown publicly, e.g. “Kitchen closes 30 min early”."
                      >
                        <Input
                          id={`special-${day.day}`}
                          value={day.specialHours ?? ""}
                          onChange={(e) => setSpecial(dayIndex, e.target.value)}
                        />
                      </Field>
                    </div>
                  </li>
                );
              })}
            </ul>
          </AdminSection>
        </div>

        {/* Live public status */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Live public status</p>
              <div className="mt-2 flex items-center gap-2">
                <Icon
                  name={isOpenNow ? "CheckCircle2" : "Moon"}
                  className={isOpenNow ? "size-4 text-success" : "size-4 text-text-secondary"}
                  aria-hidden
                />
                <span className={isOpenNow ? "text-small font-semibold text-success" : "text-small font-semibold text-text-secondary"}>
                  {isOpenNow ? "Open now" : "Closed now"}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                Illustrative — based on browser time, not the saved time zone.
              </p>
              <dl className="mt-3 flex flex-col gap-1 text-xs">
                {days.map((d) => (
                  <div key={d.day} className="flex items-center justify-between gap-2">
                    <dt className="text-text-secondary">{titleCase(d.day)}</dt>
                    <dd className="font-medium text-text-primary">
                      {d.status === "closed"
                        ? "Closed"
                        : d.periods.map((p) => `${p.open}–${p.close}`).join(", ") || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Validation</p>
              {validationErrors.length === 0 ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
                  <Icon name="CheckCircle2" className="size-3.5" aria-hidden /> No schedule conflicts.
                </p>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
                  <Icon name="AlertTriangle" className="size-3.5" aria-hidden />
                  {validationErrors.length} day(s) need fixing.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          dirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved changes · current public hours preserved
            </span>
          ) : (
            <span>All changes saved as draft.</span>
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
          <Button type="button" onClick={save} disabled={validationErrors.length > 0}>
            Save Draft
          </Button>
        </PermissionGate>
      </StickyActionBar>
    </div>
  );
}
