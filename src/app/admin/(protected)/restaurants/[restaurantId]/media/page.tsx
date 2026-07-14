"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { mediaAssetSchema, type MediaAssetInput } from "@/domain/schemas";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, titleCase } from "@/lib/utils";
import { uploadImage } from "@/lib/uploads/upload-image";
import type { MediaAsset, Restaurant } from "@/domain/entities";
import { MEDIA_TYPES, RIGHTS_STATUSES, ASSET_STATUSES, type MediaType } from "@/domain/enums";
import { PERMISSIONS, type Role } from "@/domain/permissions";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input, Select, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const PLACEHOLDER_BY_TYPE: Record<MediaType, string> = {
  food: "/placeholders/food.svg",
  restaurant: "/placeholders/restaurant.svg",
  logo: "/placeholders/logo.svg",
  cover: "/placeholders/cover.svg",
  qr: "/placeholders/qr.svg",
  nfc: "/placeholders/nfc.svg",
  campaign: "/placeholders/campaign.svg",
  avatar: "/placeholders/avatar.svg",
};

const RIGHTS_LABELS: Record<(typeof RIGHTS_STATUSES)[number], string> = {
  unknown: "Unknown",
  licensed: "Licensed",
  owned: "Owned",
  "needs-review": "Needs review",
};

const STATUS_LABELS: Record<(typeof ASSET_STATUSES)[number], string> = {
  pending: "Pending",
  ready: "Ready",
  archived: "Archived",
};

/** Resolve an asset's display image, falling back to a deterministic placeholder. */
function assetImage(asset: Pick<MediaAsset, "publicUrl" | "type">): string {
  if (
    asset.publicUrl &&
    (asset.publicUrl.startsWith("/") ||
      asset.publicUrl.startsWith("http") ||
      asset.publicUrl.startsWith("blob:"))
  ) {
    return asset.publicUrl;
  }
  return PLACEHOLDER_BY_TYPE[asset.type];
}

export default function RestaurantMediaLibraryPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [ready, setReady] = useState(false);
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [editing, setEditing] = useState<MediaAsset | null>(null);
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<MediaAsset | null>(null);
  const objectUrls = useRef<string[]>([]);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    setAssets(demoStore.media.where((m) => m.restaurantId === id));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const filtered = useMemo(
    () => (typeFilter === "all" ? assets : assets.filter((a) => a.type === typeFilter)),
    [assets, typeFilter],
  );

  const handleRemove = () => {
    if (!removeTarget) return;
    demoStore.media.remove(removeTarget.id);
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "media-manager",
      action: "media.remove",
      resourceType: "media-asset",
      resourceId: removeTarget.id,
      description: `Removed media asset ${removeTarget.filename}`,
    });
    toast({ title: "Asset removed", intent: "success" });
    setRemoveTarget(null);
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

  return (
    <div className="flex flex-col gap-6">
      <RestaurantContextHeader
        restaurant={restaurant}
        breadcrumb={[
          { label: "Admin", href: routes.admin.dashboard() },
          { label: "Restaurants", href: routes.admin.restaurants() },
          { label: restaurant.displayName, href: routes.admin.restaurant(id) },
          { label: "Media" },
        ]}
        actions={
          <PermissionGate user={user} permission={PERMISSIONS.RESTAURANT_EDIT}>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Icon name="Upload" className="size-4" aria-hidden />
              Add asset
            </Button>
          </PermissionGate>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Upload JPG, PNG, WebP, GIF, SVG or AVIF images (up to 10MB). Files are stored securely and
          shown on the restaurant&apos;s public pages.
        </span>
      </div>

      <AdminSection
        title="Media assets"
        description={`${filtered.length} of ${assets.length} asset${assets.length === 1 ? "" : "s"}`}
        icon="Images"
        actions={
          <Field label="Filter by type" htmlFor="typeFilter" className="w-48">
            <Select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MediaType | "all")}
            >
              <option value="all">All types</option>
              {MEDIA_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </Select>
          </Field>
        }
      >
        {assets.length === 0 ? (
          <EmptyState
            title="No media yet"
            description="Add an asset to start the media library for this restaurant."
            icon="Image"
          >
            <PermissionGate user={user} permission={PERMISSIONS.RESTAURANT_EDIT}>
              <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
                Add asset
              </Button>
            </PermissionGate>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching assets" description="No assets match the selected type filter." icon="Search" />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col overflow-hidden rounded-[16px] border border-border bg-canvas shadow-card"
              >
                <div className="relative h-40 w-full bg-surface">
                  <Image
                    src={assetImage(asset)}
                    alt={asset.altText ?? `${titleCase(asset.type)} asset ${asset.filename}`}
                    fill
                    sizes="(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-navy/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {titleCase(asset.type)}
                  </span>
                  {!asset.altText ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-warning/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                      <Icon name="AlertTriangle" className="size-3" aria-hidden />
                      No alt text
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate font-medium text-text-primary" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <p className="line-clamp-2 text-xs text-text-secondary">
                    {asset.altText || "No alt text provided."}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <StatusBadge group="asset" value={asset.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                      <Icon name="ShieldCheck" className="size-3" aria-hidden />
                      {RIGHTS_LABELS[asset.rightsStatus]}
                    </span>
                  </div>
                  <PermissionGate user={user} permission={PERMISSIONS.RESTAURANT_EDIT}>
                    <div className="flex items-center gap-2 pt-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditing(asset)}>
                        <Icon name="Pencil" className="size-4" aria-hidden />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${asset.filename}`}
                        onClick={() => setRemoveTarget(asset)}
                      >
                        <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                      </Button>
                    </div>
                  </PermissionGate>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSection>

      {adding ? (
        <MediaAssetDialog
          mode="create"
          restaurantId={id}
          objectUrls={objectUrls}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
          }}
          actorId={user?.id ?? "demo"}
          actorRole={user?.role ?? "media-manager"}
        />
      ) : null}

      {editing ? (
        <MediaAssetDialog
          mode="edit"
          asset={editing}
          restaurantId={id}
          objectUrls={objectUrls}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
          actorId={user?.id ?? "demo"}
          actorRole={user?.role ?? "media-manager"}
        />
      ) : null}

      <ConfirmationDialog
        open={removeTarget !== null}
        title="Remove asset?"
        description={`"${removeTarget?.filename}" will be removed from this restaurant's media library.`}
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

interface MediaAssetDialogProps {
  mode: "create" | "edit";
  asset?: MediaAsset;
  restaurantId: string;
  objectUrls: React.RefObject<string[]>;
  onClose: () => void;
  onSaved: () => void;
  actorId: string;
  actorRole: Role;
}

function MediaAssetDialog({
  mode,
  asset,
  restaurantId,
  objectUrls,
  onClose,
  onSaved,
  actorId,
  actorRole,
}: MediaAssetDialogProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(asset ? assetImage(asset) : null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    asset && asset.publicUrl.startsWith("http") ? asset.publicUrl : null,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof mediaAssetSchema>, unknown, MediaAssetInput>({
    resolver: zodResolver(mediaAssetSchema),
    defaultValues: {
      filename: asset?.filename ?? "",
      type: asset?.type ?? "food",
      altText: asset?.altText ?? "",
      rightsStatus: asset?.rightsStatus ?? "needs-review",
      status: asset?.status ?? "pending",
    },
  });

  const type = watch("type");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setPreview(url);
    setUploadedUrl(null);

    const uploaded = await uploadImage(file, "media");
    if (uploaded) {
      setUploadedUrl(uploaded);
      setPreview(uploaded);
      toast({ title: "File uploaded", description: "Saved to storage.", intent: "success" });
    } else {
      toast({
        title: "Upload preview ready",
        description: "Use a JPG, PNG, WebP, GIF, SVG or AVIF image under 10MB (and check image storage is configured).",
        intent: "warning",
      });
    }
  };

  const onSubmit = handleSubmit((input) => {
    // Use the uploaded file URL when available; otherwise fall back to a placeholder.
    const publicUrl = uploadedUrl ?? PLACEHOLDER_BY_TYPE[input.type];
    if (mode === "create") {
      const newId = createId("media");
      const created: MediaAsset = {
        id: newId,
        restaurantId,
        type: input.type,
        filename: input.filename,
        publicUrl,
        altText: input.altText ? input.altText : null,
        rightsStatus: input.rightsStatus,
        status: input.status,
      };
      demoStore.media.create(created);
      demoStore.recordActivity({
        actorId,
        actorRole,
        action: "media.create",
        resourceType: "media-asset",
        resourceId: newId,
        description: `Added media asset ${input.filename}`,
      });
      toast({
        title: "Asset added",
        description: uploadedUrl ? "File saved to storage." : "Stored as a placeholder (configure Blob to save files).",
        intent: "success",
      });
    } else if (asset) {
      demoStore.media.update(asset.id, {
        filename: input.filename,
        type: input.type,
        altText: input.altText ? input.altText : null,
        rightsStatus: input.rightsStatus,
        status: input.status,
        ...(uploadedUrl ? { publicUrl: uploadedUrl } : {}),
      });
      demoStore.recordActivity({
        actorId,
        actorRole,
        action: "media.update",
        resourceType: "media-asset",
        resourceId: asset.id,
        description: `Updated media asset ${input.filename}`,
      });
      toast({ title: "Asset updated", intent: "success" });
    }
    onSaved();
  });

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/60" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Add media asset" : "Edit media asset"}
        className="relative w-full max-w-lg overflow-hidden rounded-[20px] border border-border bg-canvas shadow-lift"
      >
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-heading text-h3 text-text-primary">
            {mode === "create" ? "Add media asset" : "Edit media asset"}
          </h2>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <Icon name="X" className="size-5" aria-hidden />
          </Button>
        </header>
        <form onSubmit={onSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-5">
          <div className="flex items-start gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface">
              <Image
                src={preview ?? PLACEHOLDER_BY_TYPE[type]}
                alt="Asset preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="media-upload">Upload</Label>
              <input
                id="media-upload"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="block w-full text-small text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-[12px] file:border file:border-input-border file:bg-canvas file:px-4 file:text-small file:font-semibold file:text-text-primary hover:file:bg-surface"
              />
              <p className="text-xs text-text-tertiary">
                Uploads to storage when Blob is configured; otherwise a placeholder is stored on save.
              </p>
            </div>
          </div>

          <Field label="Filename" htmlFor="media-filename" error={errors.filename?.message} required>
            <Input id="media-filename" {...register("filename")} aria-invalid={errors.filename ? true : undefined} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="media-type" error={errors.type?.message}>
              <Select id="media-type" {...register("type")}>
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" htmlFor="media-status" error={errors.status?.message}>
              <Select id="media-status" {...register("status")}>
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field
            label="Alt text"
            htmlFor="media-alt"
            error={errors.altText?.message}
            hint="Describe the image for screen readers and SEO."
          >
            <Input id="media-alt" {...register("altText")} />
          </Field>

          <Field label="Rights status" htmlFor="media-rights" error={errors.rightsStatus?.message}>
            <Select id="media-rights" {...register("rightsStatus")}>
              {RIGHTS_STATUSES.map((r) => (
                <option key={r} value={r}>
                  {RIGHTS_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Add asset" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
