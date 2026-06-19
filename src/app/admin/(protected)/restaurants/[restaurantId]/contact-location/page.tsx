"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { contactLocationSchema, type ContactLocationInput } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId } from "@/lib/utils";
import type { CustomerAction, Restaurant, RestaurantLocation } from "@/domain/entities";
import type { CustomerActionType } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { PreviewPanel } from "@/components/admin/preview-panel";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

/** Map our public contact methods onto customerAction rows by type. */
const CONTACT_TYPES = {
  phone: "call-order",
  whatsapp: "whatsapp",
  email: "email",
} as const satisfies Record<string, CustomerActionType>;

function findAction(actions: CustomerAction[], type: CustomerActionType): CustomerAction | undefined {
  return actions.find((a) => a.type === type);
}

function defaultValues(
  location: RestaurantLocation | undefined,
  actions: CustomerAction[],
): ContactLocationInput {
  const phone = findAction(actions, CONTACT_TYPES.phone);
  const whatsapp = findAction(actions, CONTACT_TYPES.whatsapp);
  const email = findAction(actions, CONTACT_TYPES.email);
  return {
    locationName: location?.locationName ?? "Pizza House — Downtown",
    country: location?.country ?? "",
    city: location?.city ?? "",
    district: location?.district ?? "",
    address: location?.address ?? "",
    postalCode: location?.postalCode ?? "",
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    mapUrl: location?.mapUrl ?? "",
    timezone: location?.timezone ?? "",
    publicLabel: location?.publicLabel ?? "",
    publicPhone: phone?.destination ?? "",
    publicEmail: email?.destination ?? "",
    whatsapp: whatsapp?.destination ?? "",
  };
}

export default function ContactLocationPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const { toast } = useToast();
  const user = useAdminUser();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [location, setLocation] = useState<RestaurantLocation | undefined>(undefined);
  const [ready, setReady] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof contactLocationSchema>, unknown, ContactLocationInput>({
    resolver: zodResolver(contactLocationSchema),
    mode: "onBlur",
  });

  const load = useCallback(() => {
    const r = demoStore.getRestaurant(id);
    const loc = demoStore.locations.where((l) => l.restaurantId === id)[0];
    const acts = demoStore.customerActions.where((a) => a.restaurantId === id);
    setRestaurant(r);
    setLocation(loc);
    setReady(true);
    if (r) reset(defaultValues(loc, acts));
  }, [id, reset]);

  useEffect(() => {
    load();
    const handler = () => {
      if (!isDirty) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load, isDirty]);

  const persistContactMethod = (
    type: CustomerActionType,
    destinationType: CustomerAction["destinationType"],
    label: string,
    destination: string,
  ) => {
    const existing = demoStore.customerActions
      .where((a) => a.restaurantId === id)
      .find((a) => a.type === type);
    const value = destination.trim();
    if (existing) {
      demoStore.customerActions.update(existing.id, {
        destination: value || null,
        status: value ? "configured" : "needs-config",
      });
    } else if (value) {
      const order = demoStore.customerActions.where((a) => a.restaurantId === id).length + 1;
      demoStore.customerActions.create({
        id: createId("act"),
        restaurantId: id,
        type,
        label: { en: label },
        destinationType,
        destination: value,
        enabled: true,
        status: "configured",
        sortOrder: order,
      });
    }
  };

  const persist = (input: ContactLocationInput) => {
    const patch: Omit<RestaurantLocation, "id"> = {
      restaurantId: id,
      locationName: input.locationName,
      country: input.country || null,
      city: input.city || null,
      district: input.district || null,
      address: input.address || null,
      postalCode: input.postalCode || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      mapUrl: input.mapUrl || null,
      timezone: input.timezone || null,
      publicLabel: input.publicLabel || null,
      internalNotes: location?.internalNotes ?? null,
    };

    if (location) {
      demoStore.locations.update(location.id, patch);
    } else {
      demoStore.locations.create({ id: createId("loc"), ...patch });
    }

    // Contact methods live on customerActions (phone / whatsapp / email).
    persistContactMethod(CONTACT_TYPES.phone, "phone", "Call Order", input.publicPhone ?? "");
    persistContactMethod(CONTACT_TYPES.whatsapp, "whatsapp", "WhatsApp", input.whatsapp ?? "");
    persistContactMethod(CONTACT_TYPES.email, "email", "Email", input.publicEmail ?? "");

    demoStore.recordActivity({
      actorId: user?.id ?? "unknown",
      actorRole: user?.role ?? "support-team",
      action: "contact-location.save-draft",
      resourceType: "restaurant-location",
      resourceId: location?.id ?? id,
      description: `Saved contact & location draft for ${restaurant?.displayName ?? id}.`,
    });

    toast({
      title: "Contact & location draft saved",
      description: "Changes are stored as a draft. Nothing was published.",
      intent: "success",
    });
    load();
  };

  const onSave = handleSubmit(persist);

  const previewName = restaurant?.displayName ?? "Pizza House";
  const previewLabel = watch("publicLabel");
  const previewPhone = watch("publicPhone");
  const previewMap = watch("mapUrl");
  const hasGeo = watch("latitude") != null && watch("longitude") != null;

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

  const breadcrumb = [
    { label: "Admin", href: routes.admin.dashboard() },
    { label: "Restaurants", href: routes.admin.restaurants() },
    { label: restaurant.displayName, href: routes.admin.restaurant(id) },
    { label: "Contact & Location" },
  ];

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <RestaurantContextHeader restaurant={restaurant} breadcrumb={breadcrumb} />
      <RestaurantWorkspaceTabs restaurantId={id} />

      {!location ? (
        <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
          <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            No location record exists yet. Saving will create the first location for this restaurant
            as a draft. Illustrative Admin Data.
          </span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection
            title="Primary location"
            description="Public address and structured address fields."
            icon="MapPin"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Location name"
                htmlFor="locationName"
                error={errors.locationName?.message}
                required
              >
                <Input id="locationName" {...register("locationName")} />
              </Field>
              <Field
                label="Public label"
                htmlFor="publicLabel"
                hint="Short label shown publicly, e.g. “Downtown”."
                error={errors.publicLabel?.message}
              >
                <Input id="publicLabel" {...register("publicLabel")} />
              </Field>
              <Field label="Address" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
                <Input id="address" {...register("address")} />
              </Field>
              <Field label="District" htmlFor="district" error={errors.district?.message}>
                <Input id="district" {...register("district")} />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city?.message}>
                <Input id="city" {...register("city")} />
              </Field>
              <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode?.message}>
                <Input id="postalCode" {...register("postalCode")} />
              </Field>
              <Field label="Country" htmlFor="country" error={errors.country?.message}>
                <Input id="country" {...register("country")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection
            title="Map & coordinates"
            description="Coordinates need review before they are treated as verified."
            icon="Navigation"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Latitude" htmlFor="latitude" error={errors.latitude?.message}>
                <Input id="latitude" type="number" step="any" {...register("latitude")} />
              </Field>
              <Field label="Longitude" htmlFor="longitude" error={errors.longitude?.message}>
                <Input id="longitude" type="number" step="any" {...register("longitude")} />
              </Field>
              <Field
                label="Map URL"
                htmlFor="mapUrl"
                hint="Public directions link (https only)."
                error={errors.mapUrl?.message}
                className="sm:col-span-2"
              >
                <Input id="mapUrl" inputMode="url" placeholder="https://maps.google.com/?q=…" {...register("mapUrl")} />
              </Field>
              <Field
                label="Time zone"
                htmlFor="timezone"
                hint="IANA name, e.g. America/Chicago."
                error={errors.timezone?.message}
              >
                <Input id="timezone" {...register("timezone")} />
              </Field>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning">
              <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Coordinates are <strong>Review required</strong> until a staff member verifies the map
                pin. Exact coordinates are never inferred automatically.
              </span>
            </div>
          </AdminSection>

          <AdminSection
            title="Public contact methods"
            description="These power the public Call, WhatsApp and Email customer actions."
            icon="Phone"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Public phone" htmlFor="publicPhone" error={errors.publicPhone?.message}>
                <Input id="publicPhone" inputMode="tel" placeholder="+1-512-555-0142" {...register("publicPhone")} />
              </Field>
              <Field label="WhatsApp number" htmlFor="whatsapp" error={errors.whatsapp?.message}>
                <Input id="whatsapp" inputMode="tel" placeholder="+15125550142" {...register("whatsapp")} />
              </Field>
              <Field
                label="Public email"
                htmlFor="publicEmail"
                error={errors.publicEmail?.message}
                className="sm:col-span-2"
              >
                <Input id="publicEmail" inputMode="email" placeholder="hello@example.com" {...register("publicEmail")} />
              </Field>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
              <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Editing these updates the matching customer actions (Call, WhatsApp, Email). Internal
                contacts are managed separately and never shown publicly.
              </span>
            </div>
          </AdminSection>
        </div>

        {/* Preview + readiness */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <PreviewPanel label="Public location preview">
              <div className="flex flex-col gap-3 p-4">
                <p className="font-heading text-button font-bold text-text-primary">{previewName}</p>
                <div className="rounded-[12px] bg-surface p-3">
                  <p className="text-small font-semibold text-text-primary">
                    {previewLabel || watch("city") || "Location"}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {watch("address") || "Address to be added"}
                  </p>
                </div>
                <div
                  className="flex h-24 items-center justify-center rounded-[12px] border border-dashed border-border bg-surface-muted text-xs text-text-tertiary"
                  aria-label="Map placeholder"
                >
                  {previewMap ? "Map link set · review required" : "Map unavailable"}
                </div>
                {previewPhone ? (
                  <p className="text-xs text-text-secondary">
                    <Icon name="Phone" className="mr-1 inline size-3.5" aria-hidden /> {previewPhone}
                  </p>
                ) : null}
              </div>
            </PreviewPanel>

            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Readiness</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-xs">
                <ReadyRow ok={Boolean(watch("address"))} label="Address present" />
                <ReadyRow ok={hasGeo} label="Coordinates set (review required)" />
                <ReadyRow ok={Boolean(previewMap)} label="Map link present" />
                <ReadyRow ok={Boolean(watch("timezone"))} label="Time zone set" />
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <StickyActionBar
        info={
          isDirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved changes · current public data is preserved
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
          fallback={
            <span className="text-xs text-text-tertiary">View only — saving needs edit access.</span>
          }
        >
          <Button type="submit">Save Draft</Button>
        </PermissionGate>
      </StickyActionBar>
    </form>
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
