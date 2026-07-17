"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { menuProductSchema, type MenuProductInput } from "@/domain/schemas";
import { demoStore } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { createId, formatPrice, slugify } from "@/lib/utils";
import { uploadImage } from "@/lib/uploads/upload-image";
import { resolveText } from "@/lib/i18n/locales";
import type { MenuCategory, MenuProduct, Restaurant } from "@/domain/entities";
import { AVAILABILITY_STATUSES } from "@/domain/enums";
import { PERMISSIONS } from "@/domain/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { StickyActionBar } from "@/components/admin/sticky-action-bar";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { CheckboxChipGroup } from "@/components/admin/checkbox-chip-group";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Field, Input, Textarea, Select, Label, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const DIETARY_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "halal", label: "Halal" },
  { value: "spicy", label: "Spicy" },
  { value: "dairy-free", label: "Dairy-free" },
  { value: "nut-free", label: "Nut-free" },
] as const;

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "TRY", "AED"];

const AVAILABILITY_LABELS: Record<(typeof AVAILABILITY_STATUSES)[number], string> = {
  available: "Available",
  limited: "Limited",
  "out-of-stock": "Out of stock",
  hidden: "Hidden",
};

function ProductEditor() {
  const params = useParams<{ restaurantId: string; productId: string }>();
  const id = params.restaurantId;
  const productId = params.productId;
  const isNew = productId === "new";
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [existing, setExisting] = useState<MenuProduct | null>(null);
  const [ready, setReady] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const imageObjectUrl = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof menuProductSchema>, unknown, MenuProductInput>({
    resolver: zodResolver(menuProductSchema),
    defaultValues: {
      categoryId: "",
      nameEn: "",
      descriptionEn: "",
      slug: "",
      price: 0,
      currency: "USD",
      availability: "available",
      dietaryLabels: [],
      allergenNote: "",
      featured: false,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    const cats = demoStore.categories
      .where((c) => c.restaurantId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setCategories(cats);
    const presetCategory = searchParams.get("categoryId") ?? cats[0]?.id ?? "";
    if (!isNew) {
      const product = demoStore.products.byId(productId);
      setExisting(product);
      if (product) {
        reset({
          categoryId: product.categoryId,
          nameEn: resolveText(product.localizedName),
          descriptionEn: product.localizedDescription ? resolveText(product.localizedDescription) : "",
          slug: product.slug,
          price: product.price,
          currency: product.currency,
          availability: product.availability,
          dietaryLabels: product.dietaryLabels,
          allergenNote: product.allergenNote ?? "",
          featured: product.featured,
          variants: product.variants.map((v) => ({ label: v.label, priceModifier: v.priceModifier })),
        });
        setImagePreview(product.image);
        setSlugEdited(true);
      }
    } else {
      reset({
        categoryId: presetCategory,
        nameEn: "",
        descriptionEn: "",
        slug: "",
        price: 0,
        currency: "USD",
        availability: "available",
        dietaryLabels: [],
        allergenNote: "",
        featured: false,
        variants: [],
      });
    }
    setReady(true);
  }, [id, productId, isNew, reset, searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (imageObjectUrl.current) URL.revokeObjectURL(imageObjectUrl.current);
    };
  }, []);

  const nameEn = watch("nameEn");
  const slug = watch("slug");
  const price = watch("price");
  const currency = watch("currency");
  const availability = watch("availability");
  const featured = watch("featured");
  const descriptionEn = watch("descriptionEn");

  // Auto-generate slug from name until the user edits it manually.
  useEffect(() => {
    if (!slugEdited && nameEn) {
      setValue("slug", slugify(nameEn), { shouldValidate: false });
    }
  }, [nameEn, slugEdited, setValue]);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageObjectUrl.current) URL.revokeObjectURL(imageObjectUrl.current);
    const url = URL.createObjectURL(file);
    imageObjectUrl.current = url;
    setImagePreview(url);

    const uploaded = await uploadImage(file, "products");
    if (uploaded) {
      setImagePreview(uploaded);
      toast({ title: "Image uploaded", description: "Saved to storage.", intent: "success" });
    } else {
      toast({
        title: "Image preview ready",
        description: "Use a JPG, PNG, WebP, GIF, SVG or AVIF image under 10MB (and check image storage is configured).",
        intent: "warning",
      });
    }
  };

  const onSubmit = handleSubmit((input) => {
    const localizedDescription = input.descriptionEn ? { en: input.descriptionEn } : null;
    const variants = input.variants.map((v) => ({ id: createId("var"), label: v.label, priceModifier: v.priceModifier }));
    if (isNew) {
      const newId = createId("prod");
      const siblings = demoStore.products.where((p) => p.categoryId === input.categoryId);
      const product: MenuProduct = {
        id: newId,
        categoryId: input.categoryId,
        restaurantId: id,
        slug: input.slug,
        localizedName: { en: input.nameEn },
        localizedDescription,
        price: input.price,
        currency: input.currency,
        image:
          imagePreview && (imagePreview.startsWith("/") || imagePreview.startsWith("http"))
            ? imagePreview
            : null,
        availability: input.availability,
        variants,
        dietaryLabels: input.dietaryLabels,
        allergenNote: input.allergenNote ? input.allergenNote : null,
        featured: input.featured,
        sortOrder: siblings.length,
      };
      demoStore.products.create(product);
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "product.create",
        resourceType: "menu-product",
        resourceId: newId,
        description: `Created product ${input.nameEn}`,
      });
    } else {
      demoStore.products.update(productId, {
        categoryId: input.categoryId,
        slug: input.slug,
        localizedName: { en: input.nameEn },
        localizedDescription,
        price: input.price,
        currency: input.currency,
        image:
          imagePreview && (imagePreview.startsWith("/") || imagePreview.startsWith("http"))
            ? imagePreview
            : null,
        availability: input.availability,
        variants,
        dietaryLabels: input.dietaryLabels,
        allergenNote: input.allergenNote ? input.allergenNote : null,
        featured: input.featured,
      });
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "product.update",
        resourceType: "menu-product",
        resourceId: productId,
        description: `Updated product ${input.nameEn}`,
      });
    }
    toast({
      title: isNew ? "Product created" : "Product saved",
      description: "Draft saved — nothing was published.",
      intent: "success",
    });
    router.push(routes.admin.restaurantMenu(id));
  });

  const handleDelete = () => {
    demoStore.products.remove(productId);
    demoStore.recordActivity({
      actorId: user?.id ?? "demo",
      actorRole: user?.role ?? "menu-editor",
      action: "product.remove",
      resourceType: "menu-product",
      resourceId: productId,
      description: `Removed product ${existing ? resolveText(existing.localizedName) : productId}`,
    });
    toast({ title: "Product removed", intent: "success" });
    setDeleteOpen(false);
    router.push(routes.admin.restaurantMenu(id));
  };

  const breadcrumb = useMemo(
    () => [
      { label: "Admin", href: routes.admin.dashboard() },
      { label: "Restaurants", href: routes.admin.restaurants() },
      { label: restaurant?.displayName ?? "Restaurant", href: routes.admin.restaurant(id) },
      { label: "Menu", href: routes.admin.restaurantMenu(id) },
      { label: isNew ? "New product" : "Edit product" },
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
      <EmptyState title="Product not found" description="This product may have been removed." icon="Pizza">
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

  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <AdminPageHeader title={isNew ? "New menu product" : "Edit menu product"} description={restaurant.displayName} breadcrumb={breadcrumb} />
        <EmptyState
          title="Add a category first"
          description="Products belong to a category. Create at least one category before adding products."
          icon="FolderClosed"
        >
          <Button asChild variant="secondary" size="sm">
            <Link href={routes.admin.restaurantCategory(id, "new")}>Add category</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <AdminPageHeader
        title={isNew ? "New menu product" : "Edit menu product"}
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
          <AdminSection title="Product details" icon="Info">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="categoryId" error={errors.categoryId?.message} required>
                  <Select id="categoryId" {...register("categoryId")} aria-invalid={errors.categoryId ? true : undefined}>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {resolveText(c.localizedName)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Availability" htmlFor="availability" error={errors.availability?.message}>
                  <Select id="availability" {...register("availability")}>
                    {AVAILABILITY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {AVAILABILITY_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Product name (English)" htmlFor="nameEn" error={errors.nameEn?.message} required>
                <Input id="nameEn" {...register("nameEn")} aria-invalid={errors.nameEn ? true : undefined} />
              </Field>
              <Field
                label="Slug"
                htmlFor="slug"
                error={errors.slug?.message}
                hint="Auto-generated from the name. Edit to override."
                required
              >
                <Input
                  id="slug"
                  {...register("slug", { onChange: () => setSlugEdited(true) })}
                  onBlur={(e) => setValue("slug", slugify(e.target.value), { shouldValidate: true })}
                  aria-invalid={errors.slug ? true : undefined}
                />
              </Field>
              <Field
                label="Description (English)"
                htmlFor="descriptionEn"
                error={errors.descriptionEn?.message}
              >
                <Textarea id="descriptionEn" rows={3} {...register("descriptionEn")} />
              </Field>
            </div>
          </AdminSection>

          <AdminSection title="Pricing & variants" icon="Tag">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Base price" htmlFor="price" error={errors.price?.message} required>
                  <Input id="price" type="number" min={0} step="0.01" {...register("price")} aria-invalid={errors.price ? true : undefined} />
                </Field>
                <Field label="Currency" htmlFor="currency" error={errors.currency?.message}>
                  <Select id="currency" {...register("currency")}>
                    {CURRENCY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Variants</Label>
                <p className="text-xs text-text-secondary">
                  Optional sizes or options. Price modifier is added to the base price (informational only).
                </p>
                {fields.length === 0 ? (
                  <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-4 text-center text-small text-text-secondary">
                    No variants added.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {fields.map((variant, index) => (
                      <li key={variant.id} className="flex flex-col gap-2 rounded-[12px] border border-border p-3 sm:flex-row sm:items-end">
                        <Field
                          label="Label"
                          htmlFor={`variant-label-${index}`}
                          error={errors.variants?.[index]?.label?.message}
                          className="flex-1"
                        >
                          <Input id={`variant-label-${index}`} {...register(`variants.${index}.label` as const)} />
                        </Field>
                        <Field
                          label="Price modifier"
                          htmlFor={`variant-mod-${index}`}
                          error={errors.variants?.[index]?.priceModifier?.message}
                          className="w-full sm:w-40"
                        >
                          <Input
                            id={`variant-mod-${index}`}
                            type="number"
                            step="0.01"
                            {...register(`variants.${index}.priceModifier` as const)}
                          />
                        </Field>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove variant ${index + 1}`}
                          onClick={() => remove(index)}
                        >
                          <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => append({ label: "", priceModifier: 0 })}
                >
                  <Icon name="Plus" className="size-4" aria-hidden />
                  Add variant
                </Button>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Dietary & allergens" icon="Leaf">
            <div className="flex flex-col gap-5">
              <Controller
                control={control}
                name="dietaryLabels"
                render={({ field }) => (
                  <CheckboxChipGroup
                    legend="Dietary labels"
                    options={DIETARY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <Field
                label="Allergen note"
                htmlFor="allergenNote"
                error={errors.allergenNote?.message}
                hint="Customers should always confirm allergens directly with the restaurant."
              >
                <Textarea id="allergenNote" rows={2} {...register("allergenNote")} />
              </Field>
              <label className="flex min-h-11 items-center gap-3">
                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Checkbox checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />
                  )}
                />
                <span className="text-small font-medium text-text-primary">Feature this product on the homepage</span>
              </label>
            </div>
          </AdminSection>

          <AdminSection title="Product image" icon="Image">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative size-32 shrink-0 overflow-hidden rounded-[12px] border border-border bg-surface">
                <Image
                  src={imagePreview ?? "/placeholders/food.svg"}
                  alt={nameEn ? `${nameEn} image preview` : "Product image placeholder"}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex">
                  <span className="sr-only">Upload product image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="block w-full text-small text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-[12px] file:border file:border-input-border file:bg-canvas file:px-4 file:text-small file:font-semibold file:text-text-primary hover:file:bg-surface"
                  />
                </label>
                <p className="flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
                  <Icon name="AlertTriangle" className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    Images upload to storage when Blob is configured; otherwise the preview is local
                    only. Approved imagery is also managed in the Media Library.
                  </span>
                </p>
              </div>
            </div>
          </AdminSection>
        </div>

        {/* Live public product card preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-4">
            <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
              <p className="text-small font-semibold text-text-primary">Public product card</p>
              <div className="mt-2 overflow-hidden rounded-[16px] border border-border">
                <div className="relative h-32 w-full bg-surface">
                  <Image src={imagePreview ?? "/placeholders/food.svg"} alt="" fill sizes="300px" className="object-cover" />
                  {featured ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent/90 px-2 py-0.5 text-[11px] font-semibold text-navy">
                      <Icon name="Star" className="size-3" aria-hidden />
                      Featured
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading text-button font-bold text-text-primary">{nameEn || "Product name"}</p>
                    <p className="shrink-0 font-semibold text-primary">{formatPrice(Number(price) || 0, currency)}</p>
                  </div>
                  <p className="line-clamp-2 text-xs text-text-secondary">{descriptionEn || "Short description"}</p>
                  <StatusBadge group="availability" value={availability} />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-text-tertiary">
                Preview only — no add-to-cart on customer pages.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {!isNew ? (
        <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
          <AdminSection title="Danger zone" icon="ShieldAlert">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-small text-text-secondary">Removing a product affects the draft menu only.</p>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(true)}>
                <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                Remove product
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
          <Button type="submit">{isNew ? "Create product" : "Save draft"}</Button>
        </PermissionGate>
      </StickyActionBar>

      <ConfirmationDialog
        open={deleteOpen}
        title="Remove product?"
        description="This removes the product from the draft menu. This affects the draft only."
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </form>
  );
}

export default function MenuProductEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-[16px] border border-border bg-canvas p-8 text-center text-small text-text-secondary">
          Loading…
        </div>
      }
    >
      <ProductEditor />
    </Suspense>
  );
}
