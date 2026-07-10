"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { settingsSchema, type SettingsInput } from "@/domain/schemas";
import { LOCALES, LOCALE_META } from "@/lib/i18n/locales";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import type { PlatformSettings } from "@/domain/entities";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { Field, Input, Textarea, Select, Checkbox, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useToast } from "@/components/ui/toast";

export default function PlatformSettingsPage() {
  const user = useAdminUser();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof settingsSchema>, unknown, SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "",
      defaultLocale: "en",
      supportEmail: "",
      supportPhone: "",
      seoTitleTemplate: "",
      seoDescription: "",
      maintenanceMode: false,
    },
  });

  const load = useCallback(() => {
    const s = demoStore.getSettings();
    setSettings(s);
    reset({
      siteName: s.siteName,
      defaultLocale: s.defaultLocale as SettingsInput["defaultLocale"],
      supportEmail: s.supportEmail ?? "",
      supportPhone: s.supportPhone ?? "",
      seoTitleTemplate: s.seoTitleTemplate,
      seoDescription: s.seoDescription,
      maintenanceMode: s.maintenanceMode,
    });
  }, [reset]);

  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    load();
    const handler = () => {
      if (!isDirtyRef.current) load();
    };
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  const onSave = handleSubmit((input) => {
    demoStore.updateSettings({
      siteName: input.siteName,
      defaultLocale: input.defaultLocale,
      supportEmail: input.supportEmail ? input.supportEmail : null,
      supportPhone: input.supportPhone ? input.supportPhone : null,
      seoTitleTemplate: input.seoTitleTemplate,
      seoDescription: input.seoDescription,
      maintenanceMode: input.maintenanceMode,
    });
    demoStore.recordActivity({
      actorId: user?.id ?? "user_unknown",
      actorRole: user?.role ?? "administrator",
      action: "settings.updated",
      resourceType: "platform-settings",
      resourceId: "settings",
      description: "Updated global platform & SEO settings",
    });
    toast({
      title: "Settings saved",
      description: "Saved to the demo store. In production these feed site metadata after review.",
      intent: "success",
    });
    load();
  });

  const titleTemplate = watch("seoTitleTemplate");
  const siteName = watch("siteName");
  const previewTitle = (titleTemplate || "%s").replace("%s", "Pizza House");

  return (
    <form onSubmit={onSave} className="flex flex-col gap-6">
      <AdminPageHeader
        title="Global SEO & Platform Settings"
        description="Platform identity, regional defaults and global SEO metadata. Changes are saved as a draft and never auto-applied to the live site."
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Platform Settings" },
        ]}
      />

      <div className="flex items-start gap-3 rounded-[16px] border border-info/30 bg-info/5 p-4">
        <Icon name="Info" className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
        <p className="text-small text-text-secondary">
          These values would feed public site metadata in a real backend. This screen documents the
          settings — applying them publicly is a separate, reviewed step and is not wired here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection title="Platform identity" icon="Building2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Site name" htmlFor="siteName" error={errors.siteName?.message} required>
                <Input id="siteName" {...register("siteName")} />
              </Field>
              <Field
                label="Default locale"
                htmlFor="defaultLocale"
                error={errors.defaultLocale?.message}
              >
                <Select id="defaultLocale" {...register("defaultLocale")}>
                  {LOCALES.map((code) => (
                    <option key={code} value={code}>
                      {LOCALE_META[code].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Public contact" icon="Mail">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Support email"
                htmlFor="supportEmail"
                error={errors.supportEmail?.message}
                hint="Shown publicly for enquiries."
              >
                <Input id="supportEmail" type="email" {...register("supportEmail")} />
              </Field>
              <Field
                label="Support phone"
                htmlFor="supportPhone"
                error={errors.supportPhone?.message}
              >
                <Input id="supportPhone" {...register("supportPhone")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection
            title="Global SEO"
            icon="Search"
            description="Defaults applied across public pages unless a page overrides them."
          >
            <div className="flex flex-col gap-4">
              <Field
                label="SEO title template"
                htmlFor="seoTitleTemplate"
                error={errors.seoTitleTemplate?.message}
                hint="Use %s as the page-title placeholder, e.g. “%s · YourPlatform”."
                required
              >
                <Input id="seoTitleTemplate" {...register("seoTitleTemplate")} />
              </Field>
              <Field
                label="Default meta description"
                htmlFor="seoDescription"
                error={errors.seoDescription?.message}
                hint="Up to 300 characters."
              >
                <Textarea id="seoDescription" rows={3} {...register("seoDescription")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Social image" icon="Image">
            <div className="flex flex-col gap-3">
              <Label htmlFor="socialImage">Default social sharing image</Label>
              <div className="flex flex-col items-start gap-3 rounded-[12px] border border-dashed border-border bg-surface p-5 text-center sm:flex-row sm:items-center sm:text-left">
                <span className="flex size-12 items-center justify-center rounded-[12px] bg-surface-warm text-primary">
                  <Icon name="ImagePlus" className="size-6" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="text-small font-medium text-text-primary">Upload placeholder</p>
                  <p className="text-xs text-text-secondary">
                    Image uploads are temporary in this demo and are not stored or applied publicly.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast({
                      title: "Upload simulated (demo)",
                      description: "A real backend would store and apply this social image.",
                      intent: "info",
                    })
                  }
                >
                  <Icon name="Upload" className="size-4" aria-hidden />
                  Choose image
                </Button>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Public experience" icon="Power">
            <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border bg-surface p-4">
              <Checkbox className="mt-0.5" {...register("maintenanceMode")} />
              <span>
                <span className="block text-small font-semibold text-text-primary">
                  Maintenance mode
                </span>
                <span className="block text-xs text-text-secondary">
                  When enabled, a real backend would show a maintenance page to the public. This is a
                  high-impact change and is never applied automatically on save.
                </span>
              </span>
            </label>
          </AdminSection>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Search preview</p>
              <div className="mt-3 rounded-[12px] border border-border bg-surface p-3">
                <p className="truncate text-small font-medium text-info">{previewTitle}</p>
                <p className="truncate text-xs text-success">
                  yourplatform.example
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                  {watch("seoDescription") || "Your default meta description appears here."}
                </p>
              </div>
              <p className="mt-3 text-xs text-text-tertiary">
                Illustrative preview using “{siteName || "YourPlatform"}”.
              </p>
            </div>
            {settings ? (
              <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
                <p className="text-small font-semibold text-text-primary">Applied settings</p>
                <dl className="mt-2 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-text-secondary">Maintenance</dt>
                    <dd className="font-medium text-text-primary">
                      {settings.maintenanceMode ? "On" : "Off"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-text-secondary">Default locale</dt>
                    <dd className="font-medium text-text-primary">
                      {LOCALE_META[settings.defaultLocale as keyof typeof LOCALE_META]?.label ??
                        settings.defaultLocale}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
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
        <Button type="button" variant="outline" onClick={() => load()} disabled={!isDirty}>
          Discard
        </Button>
        <Button type="submit" disabled={!isDirty}>
          Save settings
        </Button>
      </StickyActionBar>
    </form>
  );
}
