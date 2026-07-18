"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  restaurantGeneralSchema,
  isValidSlug,
  type RestaurantGeneralInput,
} from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { slugify, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import type { LocalizedText, Locale } from "@/lib/i18n/locales";
import type { Restaurant } from "@/domain/entities";
import {
  restaurantTypeOptions,
  serviceModelOptions,
  structureTypeOptions,
  visualDirectionOptions,
  projectStatusOptions,
  operationalStatusOptions,
  setupStatusOptions,
  localeOptions,
  cuisineSuggestions,
  teamSuggestions,
} from "@/components/admin/restaurant-form-options";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { CheckboxChipGroup } from "@/components/admin/checkbox-chip-group";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

function localized(value: string | undefined, locale: Locale): LocalizedText | null {
  if (!value || value.trim().length === 0) return null;
  return { en: value, [locale]: value } as LocalizedText;
}

export default function RestaurantEditPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const router = useRouter();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [ready, setReady] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"ok" | "taken" | "invalid">("ok");
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);
  const [dangerConfirm, setDangerConfirm] = useState<"disable" | "archive" | null>(null);
  const savedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof restaurantGeneralSchema>, unknown, RestaurantGeneralInput>({
    resolver: zodResolver(restaurantGeneralSchema),
    mode: "onBlur",
  });

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    setRestaurant(r);
    setReady(true);
    if (r) {
      reset({
        name: r.name,
        displayName: r.displayName,
        legalName: r.legalName ?? "",
        slug: r.slug,
        tagline: resolveText(r.tagline),
        publicDescription: resolveText(r.descriptions.public),
        restaurantTypes: r.restaurantTypes,
        cuisines: r.cuisines,
        serviceModels: r.serviceModels,
        structureType: r.structureType,
        numberOfLocations: r.numberOfLocations,
        visualDirection: r.visualDirection,
        primaryLanguage: r.primaryLanguage,
        additionalLanguages: r.additionalLanguages,
        projectStatus: r.projectStatus,
        assignedTeams: r.assignedTeams,
        internalNotes: r.internalNotes ?? "",
        operationalStatus: r.operationalStatus,
        setupStatus: r.setupStatus,
      });
    }
  }, [id, reset]);

  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    load();
    // Re-load on external changes only when not dirty to avoid clobbering edits.
    const handler = () => {
      if (!isDirtyRef.current) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

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

  const slug = watch("slug");
  const visualDirection = watch("visualDirection");
  const structureType = watch("structureType");
  const numberOfLocations = watch("numberOfLocations");

  // Slug duplicate detection (excluding current id).
  useEffect(() => {
    if (!slug) {
      setSlugStatus("ok");
      return;
    }
    if (!isValidSlug(slug)) {
      setSlugStatus("invalid");
      return;
    }
    const t = setTimeout(() => {
      setSlugStatus(demoStore.isSlugAvailable(slug, id) ? "ok" : "taken");
    }, 350);
    return () => clearTimeout(t);
  }, [slug, id]);

  const slugChanged = restaurant ? slug !== restaurant.slug : false;
  const isPublished = restaurant?.publishingStatus === "published";
  const visualChanged = restaurant ? visualDirection !== restaurant.visualDirection : false;

  const persist = (input: RestaurantGeneralInput, isDraft: boolean) => {
    demoStore.updateRestaurant(id, {
      name: input.name,
      displayName: input.displayName,
      legalName: input.legalName ? input.legalName : null,
      slug: input.slug,
      tagline: localized(input.tagline, input.primaryLanguage),
      descriptions: {
        public: localized(input.publicDescription, input.primaryLanguage),
        internal: input.internalNotes ? input.internalNotes : null,
      },
      restaurantTypes: input.restaurantTypes,
      cuisines: input.cuisines,
      serviceModels: input.serviceModels,
      structureType: input.structureType,
      numberOfLocations: input.numberOfLocations,
      visualDirection: input.visualDirection,
      primaryLanguage: input.primaryLanguage,
      additionalLanguages: input.additionalLanguages,
      projectStatus: input.projectStatus,
      assignedTeams: input.assignedTeams,
      internalNotes: input.internalNotes ? input.internalNotes : null,
      operationalStatus: input.operationalStatus,
      setupStatus: input.setupStatus,
      // Never auto-publish; publishing status is untouched here.
    });
    savedRef.current = true;
    toast({
      title: "Changes saved",
      description: isDraft
        ? "This restaurant is a draft — publish it to go live."
        : "Live now — edits to a published restaurant apply immediately.",
      intent: "success",
    });
    // Reset dirty baseline.
    load();
    savedRef.current = false;
  };

  const onSave = handleSubmit((input) => {
    if (slugStatus === "taken") {
      toast({ title: "Slug already in use", intent: "danger" });
      return;
    }
    persist(input, false);
  });

  const onSaveDraft = handleSubmit((input) => {
    if (slugStatus === "taken") {
      toast({ title: "Slug already in use", intent: "danger" });
      return;
    }
    persist(input, true);
  });

  const handleDanger = () => {
    if (!dangerConfirm) return;
    demoStore.updateRestaurant(
      id,
      dangerConfirm === "archive"
        ? { publishingStatus: "archived" }
        : { operationalStatus: "disabled" },
    );
    toast({
      title: dangerConfirm === "archive" ? "Restaurant archived" : "Restaurant disabled",
      intent: "success",
    });
    setDangerConfirm(null);
    load();
  };

  const previewName = watch("displayName");
  const previewSlug = slug;
  const watchedTypes = watch("restaurantTypes");
  const watchedServices = watch("serviceModels");

  const summary = {
    types: (watchedTypes ?? []).length,
    services: (watchedServices ?? []).length,
  };

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
        Loading…
      </div>
    );
  }

  const slugHint =
    slugStatus === "taken"
      ? "Already in use by another restaurant"
      : slugStatus === "invalid"
        ? "Lowercase letters, numbers and single hyphens only"
        : undefined;

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <AdminPageHeader
        title="Edit general information"
        description={restaurant.displayName}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(id) },
          { label: "General" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection title="Identity" icon="Info">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Restaurant name" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" {...register("name")} />
              </Field>
              <Field label="Display name" htmlFor="displayName" error={errors.displayName?.message} required>
                <Input id="displayName" {...register("displayName")} />
              </Field>
              <Field label="Legal name" htmlFor="legalName" error={errors.legalName?.message}>
                <Input id="legalName" {...register("legalName")} />
              </Field>
              <Field label="Slug" htmlFor="slug" error={errors.slug?.message} hint={slugHint} required>
                <Input
                  id="slug"
                  {...register("slug")}
                  onBlur={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })}
                  aria-invalid={errors.slug || slugStatus === "taken" ? true : undefined}
                />
              </Field>
            </div>
            {slugChanged && isPublished ? (
              <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Changing the slug of a published restaurant affects public links, QR/NFC
                  destinations, campaign URLs, redirects and SEO. These need re-checking before you
                  publish the change.
                </span>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection title="Descriptions" icon="FileText">
            <div className="flex flex-col gap-4">
              <Field
                label="Public description"
                htmlFor="publicDescription"
                error={errors.publicDescription?.message}
              >
                <Textarea id="publicDescription" rows={3} {...register("publicDescription")} />
              </Field>
              <Field label="Tagline" htmlFor="tagline" error={errors.tagline?.message}>
                <Input id="tagline" {...register("tagline")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Classification" icon="Tags">
            <div className="flex flex-col gap-5">
              <Controller
                control={control}
                name="restaurantTypes"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Restaurant types"
                    options={restaurantTypeOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.restaurantTypes?.message}
                    required
                  />
                )}
              />
              <Controller
                control={control}
                name="cuisines"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Cuisines"
                    options={cuisineSuggestions.map((c) => ({ value: c, label: c }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="serviceModels"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Service models"
                    options={serviceModelOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.serviceModels?.message}
                    required
                  />
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Structure" htmlFor="structureType" error={errors.structureType?.message}>
                  <Select id="structureType" {...register("structureType")}>
                    {structureTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Number of locations"
                  htmlFor="numberOfLocations"
                  error={errors.numberOfLocations?.message}
                >
                  <Input id="numberOfLocations" type="number" min={1} {...register("numberOfLocations")} />
                </Field>
              </div>
              {structureType !== "single-location" || Number(numberOfLocations) > 1 ? (
                <div className="flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                  <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>Multi-location setups need per-location records (managed separately).</span>
                </div>
              ) : null}
            </div>
          </AdminSection>

          <AdminSection title="Languages & timezone" icon="Languages">
            <div className="flex flex-col gap-5">
              <Field label="Primary language" htmlFor="primaryLanguage" error={errors.primaryLanguage?.message}>
                <Select id="primaryLanguage" {...register("primaryLanguage")}>
                  {localeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Controller
                control={control}
                name="additionalLanguages"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Additional languages"
                    options={localeOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </AdminSection>

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
            {visualChanged ? (
              <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  Changing visual direction is a significant change. Review branding colors,
                  typography and imagery in the Branding editor afterwards.
                </span>
              </div>
            ) : null}
          </AdminSection>

          <AdminSection title="Status" icon="Activity">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Operational" htmlFor="operationalStatus" error={errors.operationalStatus?.message}>
                <Select id="operationalStatus" {...register("operationalStatus")}>
                  {operationalStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Setup" htmlFor="setupStatus" error={errors.setupStatus?.message}>
                <Select id="setupStatus" {...register("setupStatus")}>
                  {setupStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Project" htmlFor="projectStatus" error={errors.projectStatus?.message}>
                <Select id="projectStatus" {...register("projectStatus")}>
                  {projectStatusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Internal" icon="Lock">
            <div className="flex flex-col gap-5">
              <Controller
                control={control}
                name="assignedTeams"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Assigned teams"
                    options={teamSuggestions.map((t) => ({ value: t, label: t }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <Field label="Internal notes" htmlFor="internalNotes" error={errors.internalNotes?.message}>
                <Textarea id="internalNotes" rows={3} {...register("internalNotes")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Danger zone" icon="ShieldAlert">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={restaurant.operationalStatus === "disabled"}
                onClick={() => setDangerConfirm("disable")}
              >
                <Icon name="Ban" className="size-4" aria-hidden />
                Disable
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={restaurant.publishingStatus === "archived"}
                onClick={() => setDangerConfirm("archive")}
              >
                <Icon name="Archive" className="size-4" aria-hidden />
                Archive
              </Button>
            </div>
          </AdminSection>
        </div>

        {/* Sticky summary + public identity preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Summary</p>
              <dl className="mt-2 flex flex-col gap-1.5 text-xs">
                <SummaryRow label="Types" value={String(summary.types)} />
                <SummaryRow label="Services" value={String(summary.services)} />
                <SummaryRow label="Visual" value={titleCase(visualDirection ?? "")} />
              </dl>
            </div>
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Public identity</p>
              <div className="mt-2 rounded-[12px] bg-surface p-3">
                <p className="font-heading text-button font-bold text-text-primary">
                  {previewName || "—"}
                </p>
                <p className="truncate text-xs text-text-secondary">/restaurants/{previewSlug || "…"}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          isDirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved changes
            </span>
          ) : (
            <span>All changes saved.</span>
          )
        }
      >
        <Button asChild variant="ghost">
          <Link
            href={routes.admin.restaurant(id)}
            onClick={(e) => {
              if (isDirty) {
                e.preventDefault();
                setLeaveConfirm(routes.admin.restaurant(id));
              }
            }}
          >
            Preview
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button type="submit" disabled={slugStatus === "taken"}>
          Save Changes
        </Button>
      </StickyActionBar>

      <ConfirmationDialog
        open={leaveConfirm !== null}
        title="Leave with unsaved changes?"
        description="Your edits will be lost if you leave without saving."
        confirmLabel="Leave"
        cancelLabel="Stay"
        intent="danger"
        icon="LogOut"
        onConfirm={() => {
          const target = leaveConfirm;
          savedRef.current = true;
          setLeaveConfirm(null);
          if (target) router.push(target);
        }}
        onCancel={() => setLeaveConfirm(null)}
      />

      <ConfirmationDialog
        open={dangerConfirm !== null}
        title={dangerConfirm === "archive" ? "Archive restaurant?" : "Disable restaurant?"}
        description={
          dangerConfirm === "archive"
            ? "It will be hidden from active lists. Reversible; data is kept."
            : "It will be marked disabled. Public visibility is unaffected until you publish."
        }
        confirmLabel={dangerConfirm === "archive" ? "Archive" : "Disable"}
        intent="danger"
        icon={dangerConfirm === "archive" ? "Archive" : "Ban"}
        onConfirm={handleDanger}
        onCancel={() => setDangerConfirm(null)}
      />
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="truncate font-medium text-text-primary">{value || "—"}</dd>
    </div>
  );
}
