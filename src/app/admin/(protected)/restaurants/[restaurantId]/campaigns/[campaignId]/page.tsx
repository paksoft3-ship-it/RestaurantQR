"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { campaignSchema, type CampaignInput } from "@/domain/schemas";
import { CAMPAIGN_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import type { Campaign } from "@/domain/entities";
import { demoStore } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, formatDate, slugify, titleCase } from "@/lib/utils";
import { resolveText } from "@/lib/i18n/locales";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const REWARD_TYPES = ["discount", "free-item", "points", "voucher"] as const;
const REWARD_TYPE_LABELS: Record<(typeof REWARD_TYPES)[number], string> = {
  discount: "Discount",
  "free-item": "Free item",
  points: "Points",
  voucher: "Voucher",
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function toIso(value: string | undefined): string | null {
  if (!value || value.length === 0) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export default function CampaignEditorPage() {
  const params = useParams<{ restaurantId: string; campaignId: string }>();
  const id = params.restaurantId;
  const campaignId = params.campaignId;
  const isNew = campaignId === "new";
  const router = useRouter();
  const user = useAdminUser();
  const { toast } = useToast();

  const restaurant = demoStore.getRestaurant(id);

  const [existing, setExisting] = useState<Campaign | null>(null);
  const [ready, setReady] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canEdit = !!user && (user.permissions.length === 0 || user.permissions.includes(PERMISSIONS.CAMPAIGN_EDIT));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof campaignSchema>, unknown, CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      titleEn: "",
      slug: "",
      descriptionEn: "",
      status: "draft",
      startDate: "",
      endDate: "",
      claimDeadline: "",
      rewardTitleEn: "",
      rewardType: "free-item",
      rewardValue: "",
      eligibility: "",
      attemptRules: "",
      organizer: "",
    },
  });

  const load = useCallback(() => {
    if (!isNew) {
      const campaign = demoStore.campaigns.byId(campaignId);
      setExisting(campaign);
      if (campaign) {
        reset({
          titleEn: resolveText(campaign.localizedTitle),
          slug: campaign.slug,
          descriptionEn: campaign.localizedDescription ? resolveText(campaign.localizedDescription) : "",
          status: campaign.status,
          startDate: toDateInput(campaign.startDate),
          endDate: toDateInput(campaign.endDate),
          claimDeadline: toDateInput(campaign.claimDeadline),
          rewardTitleEn: resolveText(campaign.reward.title),
          rewardType: campaign.reward.type,
          rewardValue: campaign.reward.value ?? "",
          eligibility: campaign.eligibility ?? "",
          attemptRules: campaign.attemptRules ?? "",
          organizer: campaign.organizer ?? "",
        });
        setSlugEdited(true);
      }
    }
    setReady(true);
  }, [campaignId, isNew, reset]);

  useEffect(() => {
    load();
  }, [load]);

  const titleEn = watch("titleEn");
  const slug = watch("slug");
  const status = watch("status");
  const descriptionEn = watch("descriptionEn");
  const rewardTitleEn = watch("rewardTitleEn");
  const rewardType = watch("rewardType");

  // Auto-generate slug from title until the user edits it manually.
  useEffect(() => {
    if (!slugEdited && titleEn) {
      setValue("slug", slugify(titleEn), { shouldValidate: false });
    }
  }, [titleEn, slugEdited, setValue]);

  const onSubmit = handleSubmit((input) => {
    const reward: Campaign["reward"] = {
      title: { en: input.rewardTitleEn },
      description: null,
      type: input.rewardType,
      value: input.rewardValue && input.rewardValue.length > 0 ? input.rewardValue : null,
    };

    if (isNew) {
      const newId = createId("camp");
      const campaign: Campaign = {
        id: newId,
        restaurantId: id,
        slug: input.slug,
        localizedTitle: { en: input.titleEn },
        localizedDescription: input.descriptionEn ? { en: input.descriptionEn } : null,
        status: input.status,
        startDate: toIso(input.startDate),
        endDate: toIso(input.endDate),
        claimDeadline: toIso(input.claimDeadline),
        reward,
        eligibility: input.eligibility ? input.eligibility : null,
        attemptRules: input.attemptRules ? input.attemptRules : null,
        termsVersion: "v1.0",
        organizer: input.organizer ? input.organizer : null,
        // Never auto-publish: publishing is a separate, explicit status change.
        publishingStatus: "draft",
      };
      demoStore.campaigns.create(campaign);
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "campaign-manager",
        action: "campaign.create",
        resourceType: "campaign",
        resourceId: newId,
        description: `Created campaign ${input.titleEn}`,
      });
      toast({ title: "Campaign created", description: "Saved as a draft — nothing was published.", intent: "success" });
      router.push(routes.admin.restaurantCampaigns(id));
    } else {
      demoStore.campaigns.update(campaignId, {
        slug: input.slug,
        localizedTitle: { en: input.titleEn },
        localizedDescription: input.descriptionEn ? { en: input.descriptionEn } : null,
        status: input.status,
        startDate: toIso(input.startDate),
        endDate: toIso(input.endDate),
        claimDeadline: toIso(input.claimDeadline),
        reward,
        eligibility: input.eligibility ? input.eligibility : null,
        attemptRules: input.attemptRules ? input.attemptRules : null,
        organizer: input.organizer ? input.organizer : null,
        // publishingStatus untouched — never auto-publish.
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "campaign-manager",
        action: "campaign.update",
        resourceType: "campaign",
        resourceId: campaignId,
        description: `Updated campaign ${input.titleEn}`,
      });
      toast({ title: "Campaign saved", description: "Draft saved — nothing was published.", intent: "success" });
      load();
    }
  });

  const handleDelete = () => {
    if (isNew) return;
    demoStore.campaigns.remove(campaignId);
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "campaign-manager",
      action: "campaign.remove",
      resourceType: "campaign",
      resourceId: campaignId,
      description: `Removed campaign ${existing ? resolveText(existing.localizedTitle) : campaignId}`,
    });
    toast({ title: "Campaign removed", intent: "success" });
    setDeleteOpen(false);
    router.push(routes.admin.restaurantCampaigns(id));
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

  if (ready && !isNew && !existing) {
    return (
      <EmptyState title="Campaign not found" description="This campaign may have been removed." icon="Megaphone">
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurantCampaigns(id)}>Back to campaigns</Link>
        </Button>
      </EmptyState>
    );
  }

  if (!ready || !restaurant) {
    return (
      <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AdminPageHeader
        title={isNew ? "New campaign" : "Edit campaign"}
        description={restaurant.displayName}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(id) },
          { label: "Campaigns", href: routes.admin.restaurantCampaigns(id) },
          { label: isNew ? "New" : "Edit" },
        ]}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.admin.restaurantCampaigns(id)}>
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              Back to campaigns
            </Link>
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Saving creates or updates a draft only. Publishing is a separate, explicit step. No paid entry, gambling or
          automatic winner selection is supported.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection title="Identity" icon="Info">
            <div className="flex flex-col gap-4">
              <Field label="Public title" htmlFor="titleEn" error={errors.titleEn?.message} required>
                <Input id="titleEn" {...register("titleEn")} />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Used in public campaign links. Lowercase letters, numbers and single hyphens."
                required
              >
                <Input
                  id="slug"
                  {...register("slug")}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setValue("slug", e.target.value, { shouldValidate: false });
                  }}
                  onBlur={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })}
                />
              </Field>
              <Field label="Description" htmlFor="descriptionEn" error={errors.descriptionEn?.message}>
                <Textarea id="descriptionEn" rows={3} {...register("descriptionEn")} />
              </Field>
              <Field label="Organizer" htmlFor="organizer" error={errors.organizer?.message} hint="Who runs this campaign.">
                <Input id="organizer" placeholder={restaurant.displayName} {...register("organizer")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Schedule" icon="CalendarClock">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Start date" htmlFor="startDate" error={errors.startDate?.message}>
                <Input id="startDate" type="date" {...register("startDate")} />
              </Field>
              <Field label="End date" htmlFor="endDate" error={errors.endDate?.message}>
                <Input id="endDate" type="date" {...register("endDate")} />
              </Field>
              <Field label="Claim deadline" htmlFor="claimDeadline" error={errors.claimDeadline?.message}>
                <Input id="claimDeadline" type="date" {...register("claimDeadline")} />
              </Field>
            </div>
            <Field label="Lifecycle status" htmlFor="status" error={errors.status?.message} className="mt-4 max-w-xs">
              <Select id="status" {...register("status")}>
                {CAMPAIGN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
          </AdminSection>

          <AdminSection title="Reward" icon="Gift">
            <div className="flex flex-col gap-4">
              <Field label="Reward title" htmlFor="rewardTitleEn" error={errors.rewardTitleEn?.message} required>
                <Input id="rewardTitleEn" {...register("rewardTitleEn")} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Reward type" htmlFor="rewardType" error={errors.rewardType?.message}>
                  <Select id="rewardType" {...register("rewardType")}>
                    {REWARD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {REWARD_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Reward value"
                  htmlFor="rewardValue"
                  error={errors.rewardValue?.message}
                  hint="e.g. 10% off, 1 x Garlic Bread"
                >
                  <Input id="rewardValue" {...register("rewardValue")} />
                </Field>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Rules" icon="ShieldCheck">
            <div className="flex flex-col gap-4">
              <Field
                label="Eligibility"
                htmlFor="eligibility"
                error={errors.eligibility?.message}
                hint="Who can take part and how often."
              >
                <Textarea id="eligibility" rows={2} placeholder="One reward per table per visit. Dine-in only." {...register("eligibility")} />
              </Field>
              <Field
                label="Attempt rules"
                htmlFor="attemptRules"
                error={errors.attemptRules?.message}
                hint="No purchase of attempts — entry is free."
              >
                <Textarea id="attemptRules" rows={2} placeholder="A single check-in per visit. No paid attempts." {...register("attemptRules")} />
              </Field>
            </div>
          </AdminSection>

          {!isNew ? (
            <AdminSection title="Danger zone" icon="ShieldAlert">
              <PermissionGate
                user={user}
                permission={PERMISSIONS.CAMPAIGN_EDIT}
                fallback={<p className="text-small text-text-secondary">You do not have permission to delete campaigns.</p>}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-small text-text-secondary">Removing a campaign cannot be undone in the demo.</p>
                  <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                    <Icon name="Trash2" className="size-4" aria-hidden />
                    Delete campaign
                  </Button>
                </div>
              </PermissionGate>
            </AdminSection>
          ) : null}
        </div>

        {/* Live public campaign card preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Public preview</p>
              <div className="mt-3 overflow-hidden rounded-[16px] border border-border bg-surface-warm">
                <div className="bg-navy px-4 py-3">
                  <p className="font-display text-button font-bold text-white">{titleEn || "Campaign title"}</p>
                  {descriptionEn ? (
                    <p className="mt-1 line-clamp-2 text-xs text-white/80">{descriptionEn}</p>
                  ) : null}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon name="Gift" className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-small font-semibold text-text-primary">
                        {rewardTitleEn || "Reward title"}
                      </p>
                      <p className="text-xs text-text-secondary">{REWARD_TYPE_LABELS[rewardType ?? "free-item"]}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-text-tertiary">
                    {watch("startDate") ? formatDate(toIso(watch("startDate"))) : "Start —"}
                    {" – "}
                    {watch("endDate") ? formatDate(toIso(watch("endDate"))) : "End —"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-text-tertiary">
                Illustrative preview of the public campaign card. Not yet published.
              </p>
            </div>
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Status</p>
              <div className="mt-2 flex flex-col gap-2">
                <StatusBadge group="campaign" value={status ?? "draft"} />
                {existing ? (
                  <p className="text-xs text-text-tertiary">Publishing: {titleCase(existing.publishingStatus)}</p>
                ) : (
                  <p className="text-xs text-text-tertiary">Publishing: Draft</p>
                )}
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
          <Link href={routes.admin.restaurantCampaigns(id)}>Cancel</Link>
        </Button>
        <PermissionGate
          user={user}
          permission={PERMISSIONS.CAMPAIGN_EDIT}
          fallback={
            <Button type="button" disabled>
              {isNew ? "Create draft" : "Save draft"}
            </Button>
          }
        >
          <Button type="submit">{isNew ? "Create draft" : "Save draft"}</Button>
        </PermissionGate>
      </StickyActionBar>

      <ConfirmationDialog
        open={deleteOpen}
        title="Delete campaign?"
        description={`${existing ? resolveText(existing.localizedTitle) : "This campaign"} will be removed. This cannot be undone in the demo.`}
        confirmLabel="Delete"
        intent="danger"
        icon="Trash2"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </form>
  );
}
