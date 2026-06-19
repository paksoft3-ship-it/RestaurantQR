"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { brandingEditSchema, type BrandingEditInput } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { titleCase } from "@/lib/utils";
import type { Branding, Restaurant } from "@/domain/entities";
import { RIGHTS_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import { visualDirectionOptions } from "@/components/admin/restaurant-form-options";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { PreviewPanel } from "@/components/admin/preview-panel";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const FONT_OPTIONS = ["Manrope", "Inter", "Poppins", "Playfair Display", "Nunito", "Roboto"];
const COLOR_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "primaryDark", label: "Primary Dark" },
  { key: "accent", label: "Accent" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
] as const;

/** Relative luminance for a simple WCAG-ish contrast check. */
function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6) return 0;
  const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export default function BrandingEditPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();
  const user = useAdminUser();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [ready, setReady] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const savedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof brandingEditSchema>, unknown, BrandingEditInput>({
    resolver: zodResolver(brandingEditSchema),
    mode: "onBlur",
  });

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    const b = demoStore.getBranding(id);
    setRestaurant(r);
    setBranding(b);
    setReady(true);
    if (b) {
      reset({
        visualDirection: b.visualDirection,
        colors: b.colors,
        headingFont: b.typography.headingFont,
        bodyFont: b.typography.bodyFont,
        buttonStyle: b.buttonStyle,
        cardStyle: b.cardStyle,
        iconStyle: b.iconStyle,
        rightsStatus: b.rightsStatus,
        internalNotes: "",
      });
    } else if (r) {
      reset({
        visualDirection: r.visualDirection,
        colors: {
          primary: "#F04424",
          primaryDark: "#C9341A",
          accent: "#FFC533",
          surface: "#F8FAFC",
          text: "#111827",
        },
        headingFont: "Manrope",
        bodyFont: "Inter",
        buttonStyle: "rounded",
        cardStyle: "soft",
        iconStyle: "line",
        rightsStatus: "unknown",
        internalNotes: "",
      });
    }
  }, [id, reset]);

  useEffect(() => {
    load();
    const handler = () => {
      if (!isDirty) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load, isDirty]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !savedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Clean up object URLs.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [logoPreview, coverPreview]);

  const draftColors = watch("colors");
  const headingFont = watch("headingFont");
  const bodyFont = watch("bodyFont");
  const rightsStatus = watch("rightsStatus");

  const textContrast = useMemo(() => {
    if (!draftColors?.text || !draftColors?.surface) return null;
    return contrastRatio(draftColors.text, draftColors.surface);
  }, [draftColors?.text, draftColors?.surface]);

  const readinessChecklist = [
    { label: "Brand colors set", done: !!draftColors?.primary && !!draftColors?.accent },
    { label: "Typography chosen", done: !!headingFont && !!bodyFont },
    {
      label: "Text/surface contrast ≥ 4.5:1",
      done: textContrast !== null && textContrast >= 4.5,
    },
    { label: "Image rights reviewed", done: rightsStatus !== "unknown" },
  ];

  const persist = (input: BrandingEditInput, review?: "in-review" | "approved") => {
    demoStore.updateBranding(id, {
      visualDirection: input.visualDirection,
      colors: input.colors,
      typography: { headingFont: input.headingFont, bodyFont: input.bodyFont },
      buttonStyle: input.buttonStyle,
      cardStyle: input.cardStyle,
      iconStyle: input.iconStyle,
      rightsStatus: input.rightsStatus,
      ...(review ? { reviewStatus: review } : {}),
      // Branding edits NEVER publish the restaurant.
    });
    savedRef.current = true;
    load();
    savedRef.current = false;
  };

  const onSaveDraft = handleSubmit((input) => {
    persist(input);
    toast({ title: "Branding draft saved", description: "Nothing was published.", intent: "success" });
  });

  const onSubmitReview = handleSubmit((input) => {
    persist(input, "in-review");
    toast({ title: "Submitted for review", intent: "info" });
  });

  const onApprove = handleSubmit((input) => {
    persist(input, "approved");
    toast({ title: "Branding approved", intent: "success" });
  });

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
    toast({
      title: "Upload is temporary (demo)",
      description: "This preview is local only and not persisted.",
      intent: "info",
    });
  };

  if (ready && !restaurant) {
    return (
      <EmptyState title="Restaurant not found" icon="Store">
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

  return (
    <form onSubmit={onSaveDraft} className="flex flex-col gap-6">
      <AdminPageHeader
        title="Branding"
        description={restaurant.displayName}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(id) },
          { label: "Branding" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection title="Visual direction" icon="Palette">
            <Field label="Visual direction" htmlFor="visualDirection" error={errors.visualDirection?.message}>
              <Select id="visualDirection" {...register("visualDirection")}>
                {visualDirectionOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </AdminSection>

          <AdminSection title="Brand colors" icon="Droplet">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {COLOR_FIELDS.map((cf) => (
                <Field
                  key={cf.key}
                  label={cf.label}
                  htmlFor={`color-${cf.key}`}
                  error={errors.colors?.[cf.key]?.message}
                >
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`colors.${cf.key}` as const}
                      render={({ field }) => (
                        <>
                          <input
                            type="color"
                            aria-label={`${cf.label} color picker`}
                            value={field.value ?? "#000000"}
                            onChange={field.onChange}
                            className="size-11 shrink-0 cursor-pointer rounded-[10px] border border-input-border"
                          />
                          <Input
                            id={`color-${cf.key}`}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            className="font-mono"
                          />
                        </>
                      )}
                    />
                  </div>
                </Field>
              ))}
            </div>

            {/* Live palette preview */}
            <div className="mt-4 flex flex-wrap gap-2">
              {COLOR_FIELDS.map((cf) => (
                <div key={cf.key} className="flex flex-col items-center gap-1">
                  <span
                    className="size-12 rounded-[10px] border border-border"
                    style={{ background: draftColors?.[cf.key] }}
                    aria-hidden
                  />
                  <span className="text-[10px] text-text-secondary">{cf.label}</span>
                </div>
              ))}
            </div>

            {textContrast !== null ? (
              <div
                className={
                  textContrast >= 4.5
                    ? "mt-4 flex items-center gap-2 rounded-[12px] border border-success/30 bg-success/5 p-3 text-small text-success"
                    : "mt-4 flex items-center gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning"
                }
              >
                <Icon
                  name={textContrast >= 4.5 ? "CheckCircle2" : "AlertTriangle"}
                  className="size-4 shrink-0"
                  aria-hidden
                />
                <span>
                  Text on surface contrast is {textContrast.toFixed(2)}:1
                  {textContrast >= 4.5 ? " (passes AA)." : " — below the 4.5:1 AA target."}
                </span>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection title="Typography" icon="Type">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Heading font" htmlFor="headingFont" error={errors.headingFont?.message}>
                <Select id="headingFont" {...register("headingFont")}>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Body font" htmlFor="bodyFont" error={errors.bodyFont?.message}>
                <Select id="bodyFont" {...register("bodyFont")}>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Component styles" icon="Shapes">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Button style" htmlFor="buttonStyle" error={errors.buttonStyle?.message}>
                <Select id="buttonStyle" {...register("buttonStyle")}>
                  {(["rounded", "pill", "square"] as const).map((v) => (
                    <option key={v} value={v}>
                      {titleCase(v)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Card style" htmlFor="cardStyle" error={errors.cardStyle?.message}>
                <Select id="cardStyle" {...register("cardStyle")}>
                  {(["soft", "bordered", "elevated"] as const).map((v) => (
                    <option key={v} value={v}>
                      {titleCase(v)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Icon style" htmlFor="iconStyle" error={errors.iconStyle?.message}>
                <Select id="iconStyle" {...register("iconStyle")}>
                  {(["line", "filled"] as const).map((v) => (
                    <option key={v} value={v}>
                      {titleCase(v)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Logo & cover" icon="Image">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-small font-semibold text-text-primary">Logo</span>
                <div className="flex h-28 items-center justify-center rounded-[12px] border border-dashed border-input-border bg-surface">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo preview" className="max-h-24 object-contain" />
                  ) : (
                    <span className="text-xs text-text-tertiary">No logo uploaded</span>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-small font-medium text-primary">
                  <Icon name="Upload" className="size-4" aria-hidden />
                  Upload logo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleUpload(e, setLogoPreview)}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-small font-semibold text-text-primary">Cover image</span>
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-input-border bg-surface">
                  {coverPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverPreview} alt="Cover preview" className="size-full object-cover" />
                  ) : (
                    <span className="text-xs text-text-tertiary">No cover uploaded</span>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-small font-medium text-primary">
                  <Icon name="Upload" className="size-4" aria-hidden />
                  Upload cover
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleUpload(e, setCoverPreview)}
                  />
                </label>
              </div>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              Demo uploads are temporary and shown as a local preview only.
            </p>
          </AdminSection>

          <AdminSection title="Rights & notes" icon="ShieldCheck">
            <div className="flex flex-col gap-4">
              <Field label="Image rights status" htmlFor="rightsStatus" error={errors.rightsStatus?.message}>
                <Select id="rightsStatus" {...register("rightsStatus")}>
                  {RIGHTS_STATUSES.map((v) => (
                    <option key={v} value={v}>
                      {titleCase(v)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Internal notes" htmlFor="internalNotes" error={errors.internalNotes?.message}>
                <Textarea id="internalNotes" rows={3} {...register("internalNotes")} />
              </Field>
            </div>
          </AdminSection>
        </div>

        {/* Sticky live preview + readiness */}
        <aside className="lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <PreviewPanel
              colors={draftColors}
              headingFont={headingFont}
              bodyFont={bodyFont}
              label="Live brand preview"
            >
              <div
                className="flex h-full flex-col gap-3 p-4"
                style={{ background: draftColors?.surface, color: draftColors?.text }}
              >
                <div
                  className="rounded-[12px] p-3"
                  style={{ background: draftColors?.primary, color: "#fff", fontFamily: headingFont }}
                >
                  <p className="text-sm font-bold">{restaurant.displayName}</p>
                </div>
                <button
                  type="button"
                  className="rounded-[12px] py-2 text-sm font-bold text-white"
                  style={{ background: draftColors?.primaryDark, fontFamily: bodyFont }}
                >
                  Pick Your Meal
                </button>
                <span
                  className="inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: draftColors?.accent, color: draftColors?.text }}
                >
                  Featured
                </span>
              </div>
            </PreviewPanel>

            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-small font-semibold text-text-primary">Review status</p>
                {branding ? (
                  <StatusBadge group="review" value={branding.reviewStatus} />
                ) : (
                  <StatusBadge group="review" value="not-submitted" />
                )}
              </div>
              <p className="mt-3 text-small font-semibold text-text-primary">Readiness checklist</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-small">
                {readinessChecklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <Icon
                      name={item.done ? "CheckCircle2" : "Circle"}
                      className={item.done ? "size-4 text-success" : "size-4 text-text-tertiary"}
                      aria-hidden
                    />
                    <span className={item.done ? "text-text-primary" : "text-text-secondary"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
              {branding ? (
                <p className="mt-3 text-xs text-text-secondary">
                  Current saved version: v{branding.version} ({branding.readiness}% ready). Your
                  draft updates the live preview but does not publish.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          isDirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved branding changes
            </span>
          ) : (
            <span>Branding saved. Saving never publishes.</span>
          )
        }
      >
        <Button type="submit" variant="outline">
          Save Branding Draft
        </Button>
        <Button type="button" variant="secondary" onClick={onSubmitReview}>
          Submit for Review
        </Button>
        <PermissionGate user={user} permission={PERMISSIONS.BRANDING_APPROVE}>
          <Button type="button" onClick={onApprove}>
            <Icon name="CheckCircle2" className="size-4" aria-hidden />
            Approve Branding
          </Button>
        </PermissionGate>
      </StickyActionBar>
    </form>
  );
}
