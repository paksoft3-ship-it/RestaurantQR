"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  restaurantCreateSchema,
  isValidSlug,
  type RestaurantCreateInput,
} from "@/domain/schemas";
import { demoStore } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, slugify, titleCase } from "@/lib/utils";
import type { Restaurant } from "@/domain/entities";
import type { LocalizedText, Locale } from "@/lib/i18n/locales";
import {
  restaurantTypeOptions,
  serviceModelOptions,
  structureTypeOptions,
  visualDirectionOptions,
  projectStatusOptions,
  localeOptions,
  cuisineSuggestions,
  teamSuggestions,
} from "@/components/admin/restaurant-form-options";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { CheckboxChipGroup } from "@/components/admin/checkbox-chip-group";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "basic", label: "Basic" },
  { id: "classification", label: "Classification" },
  { id: "branding", label: "Branding / Visual" },
  { id: "contact", label: "Contact" },
  { id: "location", label: "Location" },
  { id: "customer", label: "Customer Actions" },
  { id: "languages", label: "Languages" },
  { id: "hours", label: "Opening Hours" },
  { id: "scope", label: "Project Scope" },
  { id: "internal", label: "Internal" },
  { id: "review", label: "Review" },
] as const;

const NEXT_INTERNAL_ID = () => `YP-1${Math.floor(100 + Math.random() * 900)}`;

function localized(value: string | undefined, locale: Locale): LocalizedText | null {
  if (!value || value.trim().length === 0) return null;
  return { [locale]: value, en: locale === "en" ? value : value } as LocalizedText;
}

export default function NewRestaurantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [active, setActive] = useState<(typeof SECTIONS)[number]["id"]>("basic");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">(
    "idle",
  );
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof restaurantCreateSchema>, unknown, RestaurantCreateInput>({
    resolver: zodResolver(restaurantCreateSchema),
    defaultValues: {
      name: "",
      displayName: "",
      legalName: "",
      slug: "",
      tagline: "",
      publicDescription: "",
      restaurantTypes: [],
      cuisines: [],
      serviceModels: [],
      structureType: "single-location",
      numberOfLocations: 1,
      visualDirection: "modern-fast-food",
      publicPhone: "",
      publicEmail: "",
      whatsapp: "",
      country: "",
      city: "",
      address: "",
      primaryLanguage: "en",
      additionalLanguages: [],
      projectStatus: "lead",
      assignedTeams: [],
      internalNotes: "",
    },
    mode: "onBlur",
  });

  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  const watchedDisplay = watch("displayName");
  const structureType = watch("structureType");
  const numberOfLocations = watch("numberOfLocations");
  const restaurantTypes = watch("restaurantTypes");
  const serviceModels = watch("serviceModels");

  // Auto-suggest slug from name when slug untouched.
  const slugTouchedRef = useRef(false);
  useEffect(() => {
    if (!slugTouchedRef.current && watchedName) {
      setValue("slug", slugify(watchedName), { shouldValidate: false });
    }
  }, [watchedName, setValue]);

  // Debounced slug availability check.
  useEffect(() => {
    const slug = watchedSlug ?? "";
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    if (!isValidSlug(slug)) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    const t = setTimeout(() => {
      setSlugStatus(demoStore.isSlugAvailable(slug) ? "available" : "taken");
    }, 400);
    return () => clearTimeout(t);
  }, [watchedSlug]);

  // Warn on unsaved changes leaving the page.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty && !submittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const completion = useMemo(() => {
    const checks = [
      !!watchedName && !!watchedDisplay,
      !!watchedSlug && slugStatus === "available",
      restaurantTypes.length > 0 && serviceModels.length > 0,
      true, // branding always has a default
      true, // contact optional
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [
    watchedName,
    watchedDisplay,
    watchedSlug,
    slugStatus,
    restaurantTypes,
    serviceModels,
  ]);

  const buildRestaurant = (input: RestaurantCreateInput, publishingDraft: boolean): Restaurant => {
    const id = createId("rest");
    const now = new Date().toISOString();
    return {
      id,
      internalId: NEXT_INTERNAL_ID(),
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
      primaryLanguage: input.primaryLanguage,
      additionalLanguages: input.additionalLanguages,
      visualDirection: input.visualDirection,
      operationalStatus: "active",
      setupStatus: "not-started",
      projectStatus: input.projectStatus,
      // Always draft. Never auto-publish.
      publishingStatus: "draft",
      assignedTeams: input.assignedTeams,
      tags: publishingDraft ? ["draft"] : [],
      internalNotes: input.internalNotes ? input.internalNotes : null,
      createdAt: now,
      updatedAt: now,
    };
  };

  const onCreate = handleSubmit((input) => {
    if (slugStatus === "taken") {
      toast({ title: "Slug already in use", description: "Choose a different slug.", intent: "danger" });
      setActive("basic");
      return;
    }
    setSubmitting(true);
    const restaurant = buildRestaurant(input, false);
    demoStore.createRestaurant(restaurant);
    submittedRef.current = true;
    toast({
      title: "Draft created",
      description: "Nothing was published. The restaurant is a draft you can keep building.",
      intent: "success",
    });
    router.push(routes.admin.restaurant(restaurant.id));
  });

  const onSaveDraft = handleSubmit((input) => {
    setSubmitting(true);
    const restaurant = buildRestaurant(input, true);
    demoStore.createRestaurant(restaurant);
    submittedRef.current = true;
    toast({ title: "Draft saved", description: "Nothing published.", intent: "success" });
    router.push(routes.admin.restaurant(restaurant.id));
  });

  const slugHint =
    slugStatus === "checking"
      ? "Checking availability…"
      : slugStatus === "available"
        ? "Available"
        : slugStatus === "taken"
          ? "Already in use"
          : slugStatus === "invalid"
            ? "Lowercase letters, numbers and single hyphens only"
            : undefined;

  return (
    <form onSubmit={onCreate} className="flex flex-col gap-6">
      <AdminPageHeader
        title="Add Restaurant"
        description="Create a draft restaurant. This never publishes, generates QR/NFC, campaigns or accounts."
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: "Add" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr_240px]">
        {/* Sticky section nav */}
        <nav className="hidden lg:block" aria-label="Form sections">
          <ul className="sticky top-20 flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#section-${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={cn(
                    "flex min-h-9 items-center rounded-[10px] px-3 text-small font-medium transition-colors",
                    active === s.id
                      ? "bg-surface-warm text-primary"
                      : "text-text-secondary hover:bg-surface",
                  )}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection id="section-basic" title="Basic information" icon="Info">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Restaurant name" htmlFor="name" error={errors.name?.message} required>
                <Input id="name" {...register("name")} aria-invalid={errors.name ? true : undefined} />
              </Field>
              <Field
                label="Display name"
                htmlFor="displayName"
                error={errors.displayName?.message}
                required
              >
                <Input
                  id="displayName"
                  {...register("displayName")}
                  aria-invalid={errors.displayName ? true : undefined}
                />
              </Field>
              <Field label="Legal name" htmlFor="legalName" hint="Optional" error={errors.legalName?.message}>
                <Input id="legalName" {...register("legalName")} />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint={slugHint}
                required
              >
                <Input
                  id="slug"
                  {...register("slug", {
                    onChange: () => {
                      slugTouchedRef.current = true;
                    },
                  })}
                  aria-invalid={errors.slug || slugStatus === "taken" ? true : undefined}
                />
              </Field>
              <Field
                label="Tagline"
                htmlFor="tagline"
                className="sm:col-span-2"
                error={errors.tagline?.message}
              >
                <Input id="tagline" {...register("tagline")} />
              </Field>
              <Field
                label="Public description"
                htmlFor="publicDescription"
                className="sm:col-span-2"
                error={errors.publicDescription?.message}
              >
                <Textarea id="publicDescription" rows={3} {...register("publicDescription")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection id="section-classification" title="Classification" icon="Tags">
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
                  <Input
                    id="numberOfLocations"
                    type="number"
                    min={1}
                    {...register("numberOfLocations")}
                  />
                </Field>
              </div>
              {(structureType !== "single-location" || Number(numberOfLocations) > 1) ? (
                <div className="flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
                  <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Multi-location restaurants need separate location records. Add them after the
                    draft is created.
                  </span>
                </div>
              ) : null}
            </div>
          </AdminSection>

          <AdminSection id="section-branding" title="Branding / Visual direction" icon="Palette">
            <Field label="Visual direction" htmlFor="visualDirection" error={errors.visualDirection?.message}>
              <Select id="visualDirection" {...register("visualDirection")}>
                {visualDirectionOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="mt-2 text-xs text-text-secondary">
              Full brand colors and typography are configured in the Branding editor after creation.
            </p>
          </AdminSection>

          <AdminSection id="section-contact" title="Contact" icon="Phone">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Public phone" htmlFor="publicPhone" error={errors.publicPhone?.message}>
                <Input id="publicPhone" {...register("publicPhone")} />
              </Field>
              <Field label="Public email" htmlFor="publicEmail" error={errors.publicEmail?.message}>
                <Input id="publicEmail" type="email" {...register("publicEmail")} />
              </Field>
              <Field label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp?.message}>
                <Input id="whatsapp" {...register("whatsapp")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection id="section-location" title="Location" icon="MapPin">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Country" htmlFor="country" error={errors.country?.message}>
                <Input id="country" {...register("country")} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city?.message}>
                <Input id="city" {...register("city")} />
              </Field>
              <Field label="Address" htmlFor="address" className="sm:col-span-2" error={errors.address?.message}>
                <Input id="address" {...register("address")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection id="section-customer" title="Customer actions" icon="MousePointerClick">
            <p className="text-small text-text-secondary">
              The four primary actions (Call Order, Pick Your Meal, Online Order with Pay, Visit Us)
              are configured in the Customer Actions editor after the draft is created. Online order
              always links to an external ordering site — never an internal cart.
            </p>
          </AdminSection>

          <AdminSection id="section-languages" title="Languages" icon="Languages">
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

          <AdminSection id="section-hours" title="Opening hours" icon="Clock">
            <p className="text-small text-text-secondary">
              A simple weekly schedule is set in the Opening Hours editor after creation. New drafts
              start with no public hours.
            </p>
          </AdminSection>

          <AdminSection id="section-scope" title="Project scope" icon="Briefcase">
            <Field label="Project status" htmlFor="projectStatus" error={errors.projectStatus?.message}>
              <Select id="projectStatus" {...register("projectStatus")}>
                {projectStatusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </AdminSection>

          <AdminSection id="section-internal" title="Internal" icon="Lock">
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

          <AdminSection id="section-review" title="Review" icon="CheckCircle2">
            <ul className="flex flex-col gap-2 text-small">
              <ReviewRow label="Name" value={watchedDisplay || watchedName} />
              <ReviewRow label="Slug" value={watchedSlug} status={slugStatus} />
              <ReviewRow label="Types" value={restaurantTypes.map(titleCase).join(", ")} />
              <ReviewRow label="Service models" value={serviceModels.map(titleCase).join(", ")} />
            </ul>
            <p className="mt-4 rounded-[12px] bg-surface p-3 text-xs text-text-secondary">
              Creating this restaurant produces a <strong>draft</strong> only. It does not publish,
              generate QR/NFC, create campaigns or accounts.
            </p>
          </AdminSection>
        </div>

        {/* Sticky summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-3 rounded-[16px] border border-border bg-canvas p-4 shadow-card">
            <p className="text-small font-semibold text-text-primary">Completion</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-text-secondary">{completion}% of key fields complete</p>
            <dl className="mt-2 flex flex-col gap-1.5 text-xs">
              <SummaryRow label="Name" value={watchedDisplay || watchedName || "—"} />
              <SummaryRow label="Slug" value={watchedSlug || "—"} />
              <SummaryRow label="Types" value={String(restaurantTypes.length)} />
              <SummaryRow label="Locations" value={String(numberOfLocations)} />
            </dl>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          <span className="flex items-center gap-1.5">
            <Icon name="Info" className="size-4 text-text-tertiary" aria-hidden />
            Drafts only — nothing is published.
          </span>
        }
      >
        <Button type="button" variant="outline" onClick={onSaveDraft} disabled={submitting}>
          Save Draft
        </Button>
        <Button type="submit" disabled={submitting || slugStatus === "taken"}>
          {submitting ? <Icon name="Loader2" className="size-4 animate-spin" aria-hidden /> : null}
          Create
        </Button>
      </StickyActionBar>
    </form>
  );
}

function ReviewRow({
  label,
  value,
  status,
}: {
  label: string;
  value?: string;
  status?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0">
      <span className="text-text-secondary">{label}</span>
      <span className="flex items-center gap-1.5 text-right font-medium text-text-primary">
        {value || "—"}
        {status === "available" ? (
          <Icon name="CheckCircle2" className="size-4 text-success" aria-hidden />
        ) : status === "taken" ? (
          <Icon name="XCircle" className="size-4 text-danger" aria-hidden />
        ) : null}
      </span>
    </li>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="truncate font-medium text-text-primary">{value}</dd>
    </div>
  );
}
