"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { demoStore, DEMO_STORE_EVENT } from "@/lib/storage/demo-store";
import { routes } from "@/lib/routes";
import { resolveText } from "@/lib/i18n/locales";
import { formatDate, formatPrice } from "@/lib/utils";
import { appConfig } from "@/lib/config/app-config";
import type { MenuCategory, MenuProduct, Restaurant } from "@/domain/entities";
import type { MenuImport } from "@/domain/menu-import";
import { PROCESSING_STATUS_META } from "@/domain/menu-import";
import { menuImportService } from "@/features/menu-import/service";
import { PERMISSIONS } from "@/domain/permissions";
import { AdminSection } from "@/components/admin/admin-section";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { RestaurantContextHeader } from "@/components/admin/restaurant-context-header";
import { RestaurantWorkspaceTabs } from "@/components/admin/restaurant-workspace-tabs";
import { useAdminUser } from "@/components/admin/admin-user-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { EmptyState } from "@/components/shared/states";
import { useToast } from "@/components/ui/toast";

const MENU_STATUS_CYCLE = { draft: "active", active: "hidden", hidden: "draft" } as const;

interface RemoveTarget {
  kind: "category" | "product";
  id: string;
  label: string;
}

export default function DigitalMenuManagerPage() {
  const params = useParams<{ restaurantId: string }>();
  const id = params.restaurantId;
  const user = useAdminUser();
  const { toast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [ready, setReady] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);
  const [recentImports, setRecentImports] = useState<MenuImport[]>([]);

  const load = useCallback(() => {
    setRestaurant(demoStore.getRestaurant(id));
    const cats = demoStore.categories
      .where((c) => c.restaurantId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    setCategories(cats);
    setProducts(
      demoStore.products
        .where((p) => p.restaurantId === id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
    if (appConfig.features.menuPdfImport) {
      setRecentImports(
        menuImportService
          .listByRestaurant(id)
          .filter((imp) => imp.processingStatus !== "ARCHIVED")
          .slice(0, 3),
      );
    }
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener(DEMO_STORE_EVENT, handler);
    return () => window.removeEventListener(DEMO_STORE_EVENT, handler);
  }, [load]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, MenuProduct[]>();
    for (const p of products) {
      const list = map.get(p.categoryId) ?? [];
      list.push(p);
      map.set(p.categoryId, list);
    }
    return map;
  }, [products]);

  const stats = useMemo(() => {
    const activeCategories = categories.filter((c) => c.status === "active").length;
    const availableProducts = products.filter((p) => p.availability === "available").length;
    return {
      categories: categories.length,
      activeCategories,
      products: products.length,
      availableProducts,
    };
  }, [categories, products]);

  const reorderCategories = (categoryId: string, direction: -1 | 1) => {
    const ids = categories.map((c) => c.id);
    const index = ids.indexOf(categoryId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    demoStore.categories.reorder(ids);
    demoStore.categories.setAll(
      demoStore.categories.all().map((c) => {
        const newOrder = ids.indexOf(c.id);
        return newOrder >= 0 ? { ...c, sortOrder: newOrder } : c;
      }),
    );
    toast({ title: "Category order updated", description: "Draft only — nothing published.", intent: "success" });
  };

  const reorderProducts = (categoryId: string, productId: string, direction: -1 | 1) => {
    const inCategory = (productsByCategory.get(categoryId) ?? []).map((p) => p.id);
    const index = inCategory.indexOf(productId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= inCategory.length) return;
    [inCategory[index], inCategory[target]] = [inCategory[target], inCategory[index]];
    demoStore.products.setAll(
      demoStore.products.all().map((p) => {
        const newOrder = inCategory.indexOf(p.id);
        return newOrder >= 0 ? { ...p, sortOrder: newOrder } : p;
      }),
    );
    toast({ title: "Product order updated", description: "Draft only — nothing published.", intent: "success" });
  };

  const cycleCategoryStatus = (category: MenuCategory) => {
    const next = MENU_STATUS_CYCLE[category.status];
    demoStore.categories.update(category.id, { status: next });
    toast({ title: `Category set to ${next}`, description: "Draft change saved.", intent: "success" });
  };

  const toggleProductAvailability = (product: MenuProduct) => {
    const next = product.availability === "available" ? "hidden" : "available";
    demoStore.products.update(product.id, { availability: next });
    toast({
      title: next === "available" ? "Product available" : "Product hidden",
      description: "Draft change saved.",
      intent: "success",
    });
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    if (removeTarget.kind === "category") {
      const childCount = (productsByCategory.get(removeTarget.id) ?? []).length;
      demoStore.categories.remove(removeTarget.id);
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "category.remove",
        resourceType: "menu-category",
        resourceId: removeTarget.id,
        description: `Removed category ${removeTarget.label}${childCount > 0 ? ` (${childCount} product(s) still reference it)` : ""}`,
      });
    } else {
      demoStore.products.remove(removeTarget.id);
      demoStore.recordActivity({
        actorId: user?.id ?? "demo",
        actorRole: user?.role ?? "menu-editor",
        action: "product.remove",
        resourceType: "menu-product",
        resourceId: removeTarget.id,
        description: `Removed product ${removeTarget.label}`,
      });
    }
    toast({ title: `${removeTarget.kind === "category" ? "Category" : "Product"} removed`, intent: "success" });
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
          { label: "Menu" },
        ]}
        actions={
          <>
            {appConfig.features.menuPdfImport ? (
              <PermissionGate user={user} permission={PERMISSIONS.MENU_IMPORT_VIEW}>
                <Button asChild variant="outline" size="sm">
                  <Link href={routes.admin.restaurantMenuImport(id)}>
                    <Icon name="FileUp" className="size-4" aria-hidden />
                    Import Menu from PDF
                  </Link>
                </Button>
              </PermissionGate>
            ) : null}
            <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
              <Button asChild size="sm">
                <Link href={routes.admin.restaurantCategory(id, "new")}>
                  <Icon name="Plus" className="size-4" aria-hidden />
                  Add category
                </Link>
              </Button>
            </PermissionGate>
          </>
        }
      />

      <RestaurantWorkspaceTabs restaurantId={id} />

      <div className="flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info">
        <Icon name="Info" className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          Illustrative Admin Data. Changes here update the draft menu only — nothing is published or
          auto-applied. Use the restaurant publishing workflow to go live.
        </span>
      </div>

      {appConfig.features.menuPdfImport && recentImports.length > 0 ? (
        <div className="rounded-[16px] border border-border bg-canvas p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-small font-semibold text-text-primary">
              <Icon name="FileUp" className="size-4 text-primary" aria-hidden />
              Recent PDF imports
            </p>
            <Button asChild variant="link" size="sm">
              <Link href={routes.admin.restaurantMenuImport(id)}>View all imports</Link>
            </Button>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {recentImports.map((imp) => {
              const meta = PROCESSING_STATUS_META[imp.processingStatus];
              return (
                <li key={imp.id}>
                  <Link
                    href={routes.admin.restaurantMenuImportDetail(id, imp.id)}
                    className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-[12px] border border-border bg-surface px-3 py-2 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Icon name="FileText" className="size-4 shrink-0 text-text-secondary" aria-hidden />
                      <span className="truncate text-small font-medium text-text-primary">
                        {imp.originalFileName}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{formatDate(imp.createdAt)}</span>
                      <Badge intent={meta.intent}>
                        <Icon name={meta.icon} className="size-3" aria-hidden />
                        {meta.label}
                      </Badge>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Categories" value={stats.categories} icon="FolderTree" />
        <StatCard label="Active categories" value={stats.activeCategories} icon="CheckCircle2" />
        <StatCard label="Products" value={stats.products} icon="Pizza" />
        <StatCard label="Available products" value={stats.availableProducts} icon="Eye" />
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add your first menu category to start building this restaurant's digital menu."
          icon="BookOpen"
        >
          <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
            <Button asChild variant="secondary" size="sm">
              <Link href={routes.admin.restaurantCategory(id, "new")}>Add category</Link>
            </Button>
          </PermissionGate>
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {categories.map((category, categoryIndex) => {
            const items = productsByCategory.get(category.id) ?? [];
            return (
              <AdminSection
                key={category.id}
                title={resolveText(category.localizedName)}
                description={`${items.length} product${items.length === 1 ? "" : "s"}`}
                icon="FolderClosed"
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge group="menu" value={category.status} />
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${resolveText(category.localizedName)} up`}
                        disabled={categoryIndex === 0}
                        onClick={() => reorderCategories(category.id, -1)}
                      >
                        <Icon name="ChevronUp" className="size-4" aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Move ${resolveText(category.localizedName)} down`}
                        disabled={categoryIndex === categories.length - 1}
                        onClick={() => reorderCategories(category.id, 1)}
                      >
                        <Icon name="ChevronDown" className="size-4" aria-hidden />
                      </Button>
                    </div>
                    <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
                      <Button type="button" variant="outline" size="sm" onClick={() => cycleCategoryStatus(category)}>
                        <Icon name="RefreshCw" className="size-4" aria-hidden />
                        Status
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={routes.admin.restaurantCategory(id, category.id)}>
                          <Icon name="Pencil" className="size-4" aria-hidden />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${resolveText(category.localizedName)}`}
                        onClick={() =>
                          setRemoveTarget({
                            kind: "category",
                            id: category.id,
                            label: resolveText(category.localizedName),
                          })
                        }
                      >
                        <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                      </Button>
                    </PermissionGate>
                  </div>
                }
              >
                <div className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <p className="rounded-[12px] border border-dashed border-border bg-surface px-4 py-6 text-center text-small text-text-secondary">
                      No products in this category yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {items.map((product, productIndex) => (
                        <li
                          key={product.id}
                          className="flex flex-col gap-3 rounded-[12px] border border-border bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex items-center gap-0.5">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Move ${resolveText(product.localizedName)} up`}
                                disabled={productIndex === 0}
                                onClick={() => reorderProducts(category.id, product.id, -1)}
                              >
                                <Icon name="ChevronUp" className="size-4" aria-hidden />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Move ${resolveText(product.localizedName)} down`}
                                disabled={productIndex === items.length - 1}
                                onClick={() => reorderProducts(category.id, product.id, 1)}
                              >
                                <Icon name="ChevronDown" className="size-4" aria-hidden />
                              </Button>
                            </div>
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 truncate font-medium text-text-primary">
                                {resolveText(product.localizedName)}
                                {product.featured ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-warning">
                                    <Icon name="Star" className="size-3" aria-hidden />
                                    Featured
                                  </span>
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-text-secondary">
                                {formatPrice(product.price, product.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge group="availability" value={product.availability} />
                            <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleProductAvailability(product)}
                              >
                                <Icon
                                  name={product.availability === "available" ? "EyeOff" : "Eye"}
                                  className="size-4"
                                  aria-hidden
                                />
                                {product.availability === "available" ? "Hide" : "Show"}
                              </Button>
                              <Button asChild variant="outline" size="sm">
                                <Link href={routes.admin.restaurantProduct(id, product.id)}>
                                  <Icon name="Pencil" className="size-4" aria-hidden />
                                  Edit
                                </Link>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${resolveText(product.localizedName)}`}
                                onClick={() =>
                                  setRemoveTarget({
                                    kind: "product",
                                    id: product.id,
                                    label: resolveText(product.localizedName),
                                  })
                                }
                              >
                                <Icon name="Trash2" className="size-4 text-danger" aria-hidden />
                              </Button>
                            </PermissionGate>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <PermissionGate user={user} permission={PERMISSIONS.MENU_EDIT}>
                    <Button asChild variant="ghost" size="sm" className="self-start">
                      <Link href={`${routes.admin.restaurantProduct(id, "new")}?categoryId=${category.id}`}>
                        <Icon name="Plus" className="size-4" aria-hidden />
                        Add product
                      </Link>
                    </Button>
                  </PermissionGate>
                </div>
              </AdminSection>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        open={removeTarget !== null}
        title={removeTarget?.kind === "category" ? "Remove category?" : "Remove product?"}
        description={
          removeTarget?.kind === "category"
            ? `"${removeTarget?.label}" will be removed from this draft menu. Products that referenced it will need a new category before publishing.`
            : `"${removeTarget?.label}" will be removed from this draft menu. This affects the draft only.`
        }
        confirmLabel="Remove"
        intent="danger"
        icon="Trash2"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-border bg-canvas p-4 shadow-card">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
        <Icon name={icon} className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-h3 text-text-primary">{value}</p>
        <p className="truncate text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
