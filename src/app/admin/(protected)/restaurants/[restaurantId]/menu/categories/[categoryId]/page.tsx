"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { menuCategorySchema, type MenuCategoryInput } from "@/domain/schemas";
import { demoStore } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId } from "@/lib/utils";
import { uploadImage } from "@/lib/uploads/upload-image";
import { resolveText } from "@/lib/i18n/locales";
import type { MenuCategory, Restaurant } from "@/domain/entities";
import { MENU_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
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

const STATUS_LABELS: Record<(typeof MENU_STATUSES)[number], string> = {
  draft: "Draft (hidden from public)",
  active: "Active (shown on menu)",
  hidden: "Hidden",
};

export default function MenuCategoryEditorPage() {
  const params = useParams<{ restaurantId: string; categoryId: string }>();
  const id = params.restaurantId;
  const categoryId = params.categoryId;
  const isNew = categoryId === "new";
  const router = useRouter();
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [existing, setExisting] = useState<MenuCategory | null>(null);
  const [ready, setReady] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof menuCategorySchema>, unknown, MenuCategoryInput>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: { nameEn: "", descriptionEn: "", status: "draft", sortOrder: 0 },
  });

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    if (!isNew) {
      const category = demoStore.categories.byId(categoryId);
      setExisting(category);
      if (category) {
        reset({
          nameEn: resolveText(category.localizedName),
          descriptionEn: category.localizedDescription ? resolveText(category.localizedDescription) : "",
          status: category.status,
          sortOrder: category.sortOrder,
        });
        setImagePreview(category.image);
      }
    } else {
      const siblings = demoStore.categories.where((c) => c.restaurantId === id);
      reset({ nameEn: "", descriptionEn: "", status: "draft", sortOrder: siblings.length });
    }
    setReady(true);
  }, [id, categoryId, isNew, reset]);

  useEffect(() => {
    load();
  }, [load]);

  const imageObjectUrl = useRef<string | null>(null);
  useEffect(() => {
    return () => {
      if (imageObjectUrl.current) URL.revokeObjectURL(imageObjectUrl.current);
    };
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageObjectUrl.current) URL.revokeObjectURL(imageObjectUrl.current);
    const url = URL.createObjectURL(file);
    imageObjectUrl.current = url;
    setImagePreview(url);

    const uploaded = await uploadImage(file, "categories");
    if (uploaded) {
      setImagePreview(uploaded);
      toast({ title: "Image uploaded", description: "Saved to storage.", intent: "success" });
    } else {
      toast({
        title: "Image preview ready",
        description: "Preview only — configure Blob storage (BLOB_READ_WRITE_TOKEN) to save uploads.",
        intent: "warning",
      });
    }
  };

  const onSubmit = handleSubmit((input) => {
    const localizedDescription = input.descriptionEn ? { en: input.descriptionEn } : null;
    if (isNew) {
      const newId = createId("cat");
      const category: MenuCategory = {
        id: newId,
        restaurantId: id,
        localizedName: { en: input.nameEn },
        localizedDescription,
        sortOrder: input.sortOrder,
        status: input.status,
        image:
          imagePreview && (imagePreview.startsWith("/") || imagePreview.startsWith("http"))
            ? imagePreview
            : null,
      };
      demoStore.categories.create(category);
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "category.create",
        resourceType: "menu-category",
        resourceId: newId,
        description: `Created category ${input.nameEn}`,
      });
    } else {
      demoStore.categories.update(categoryId, {
        localizedName: { en: input.nameEn },
        localizedDescription,
        sortOrder: input.sortOrder,
        status: input.status,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "category.update",
        resourceType: "menu-category",
        resourceId: categoryId,
        description: `Updated category ${input.nameEn}`,
      });
    }
    toast({
      title: isNew ? "Category created" : "Category saved",
      description: "Draft saved — nothing was published.",
      intent: "success",
    });
    router.push(routes.admin.restaurantMenu(id));
  });

  const handleDelete = () => {
    demoStore.categories.remove(categoryId);
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "menu-editor",
      action: "category.remove",
      resourceType: "menu-category",
      resourceId: categoryId,
      description: `Removed category ${existing ? resolveText(existing.localizedName) : categoryId}`,
    });
    toast({ title: "Category removed", intent: "success" });
    setDeleteOpen(false);
    router.push(routes.admin.restaurantMenu(id));
  };

  const status = watch("status");
  const nameEn = watch("nameEn");

  const breadcrumb = useMemo(
    () => [
      { label: "Admin", href: routes.admin.dashboard() },
      { label: "Restaurants", href: routes.admin.restaurants() },
      { label: restaurant?.displayName ?? "Restaurant", href: routes.admin.restaurant(id) },
      { label: "Menu", href: routes.admin.restaurantMenu(id) },
      { label: isNew ? "New category" : "Edit category" },
    ],
    [restaurant, id, isNew],
  );

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
      <EmptyState title="Category not found" description="This category may have been removed." icon="FolderClosed">
        <Button asChild variant="secondary" size="sm">
          <Link href={routes.admin.restaurantMenu(id)}>Back to menu</Link>
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
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AdminPageHeader
        title={isNew ? "New menu category" : "Edit menu category"}
        description={restaurant.displayName}
        breadcrumb={breadcrumb}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={routes.admin.restaurantMenu(id)}>
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              Back to menu
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminSection title="Category details" icon="Info">
            <div className="flex flex-col gap-4">
              <Field label="Category name (English)" htmlFor="nameEn" error={errors.nameEn?.message} required>
                <Input id="nameEn" {...register("nameEn")} aria-invalid={errors.nameEn ? true : undefined} />
              </Field>
              <Field
                label="Short description (English)"
                htmlFor="descriptionEn"
                error={errors.descriptionEn?.message}
                hint="Optional. Shown under the category heading on the public menu."
              >
                <Textarea id="descriptionEn" rows={3} {...register("descriptionEn")} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Status" htmlFor="status" error={errors.status?.message}>
                  <Select id="status" {...register("status")}>
                    {MENU_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Sort order"
                  htmlFor="sortOrder"
                  error={errors.sortOrder?.message}
                  hint="Lower numbers appear first."
                >
                  <Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
                </Field>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Category image" icon="Image">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative size-32 shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface">
                <Image
                  src={imagePreview ?? "/placeholders/food.svg"}
                  alt={nameEn ? `${nameEn} category image preview` : "Category image placeholder"}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex">
                  <span className="sr-only">Upload category image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleImage}
                    className="block w-full text-small text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-[12px] file:border file:border-input-border file:bg-canvas file:px-4 file:text-small file:font-semibold file:text-text-primary hover:file:bg-surface"
                  />
                </label>
                <p className="flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                  <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Images upload to storage when Blob is configured; otherwise the preview is local
                    only. Approved media is also managed in the Media Library.
                  </span>
                </p>
              </div>
            </div>
          </AdminSection>
        </div>

        {/* Preview + status */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Status</p>
              <div className="mt-2">
                <StatusBadge group="menu" value={status} />
              </div>
            </div>
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Public preview</p>
              <div className="mt-2 overflow-hidden rounded-[12px] border border-border">
                <div className="relative h-24 w-full bg-surface">
                  <Image
                    src={imagePreview ?? "/placeholders/food.svg"}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="font-heading text-button font-bold text-text-primary">{nameEn || "Category name"}</p>
                  <p className="text-xs text-text-secondary">{watch("descriptionEn") || "Short description"}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {!isNew ? (
        <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
          <AdminSection title="Danger zone" icon="ShieldAlert">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-small text-text-secondary">
                Removing a category does not delete its products. Move products to another category before
                publishing.
              </p>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                Remove category
              </Button>
            </div>
          </AdminSection>
        </PermissionGate>
      ) : null}

      <StickyActionBar
        info={
          isDirty ? (
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="Circle" className="size-2.5 fill-current" aria-hidden />
              Unsaved changes
            </span>
          ) : (
            <span>Draft only — nothing is published.</span>
          )
        }
      >
        <Button asChild variant="ghost">
          <Link href={routes.admin.restaurantMenu(id)}>Cancel</Link>
        </Button>
        <PermissionGate
          user={user}
          permission={PERMISSIONS.MENU_EDIT}
          fallback={
            <Button type="button" disabled>
              Save draft
            </Button>
          }
        >
          <Button type="submit">{isNew ? "Create category" : "Save draft"}</Button>
        </PermissionGate>
      </StickyActionBar>

      <ConfirmationDialog
        open={deleteOpen}
        title="Remove category?"
        description="This removes the category from the draft menu. Its products are kept but will need a new category before publishing."
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </form>
  );
}
