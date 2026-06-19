"use client";

import { useMemo, useState } from "react";
import type { MenuCategory, MenuProduct } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { EmptyState } from "@/components/shared/states";
import { MenuProductCard } from "./menu-product-card";
import { MenuCategoryNav, type MenuCategoryNavItem } from "./menu-category-nav";

interface MenuBrowserProps {
  restaurantSlug: string;
  categories: MenuCategory[];
  products: MenuProduct[];
}

/**
 * Interactive digital menu: search + category chips filter an image-led product
 * list. Handles two distinct empty states — a category with no items, and a
 * search that returns no results. No cart, no checkout.
 */
export function MenuBrowser({ restaurantSlug, categories, products }: MenuBrowserProps) {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState("all");

  const navItems: MenuCategoryNavItem[] = useMemo(
    () => categories.map((c) => ({ id: c.id, name: resolveText(c.localizedName, "en") })),
    [categories],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return products.filter((product) => {
      if (activeId !== "all" && product.categoryId !== activeId) return false;
      if (!normalizedSearch) return true;
      const name = resolveText(product.localizedName, "en").toLowerCase();
      const description = resolveText(product.localizedDescription, "en").toLowerCase();
      return name.includes(normalizedSearch) || description.includes(normalizedSearch);
    });
  }, [products, activeId, normalizedSearch]);

  // Group results by category for clear sectioning when browsing "All".
  const grouped = useMemo(() => {
    const visibleCategories =
      activeId === "all" ? categories : categories.filter((c) => c.id === activeId);
    return visibleCategories
      .map((category) => ({
        category,
        items: filtered.filter((p) => p.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filtered, activeId]);

  const activeCategory =
    activeId === "all" ? null : categories.find((c) => c.id === activeId) ?? null;

  return (
    <div>
      <MenuCategoryNav
        categories={navItems}
        search={search}
        onSearchChange={setSearch}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <div className="mt-6 flex flex-col gap-8 pb-4">
        {filtered.length === 0 ? (
          normalizedSearch ? (
            <EmptyState
              icon="Search"
              title="No matching items"
              description={`Nothing matches “${search.trim()}”. Try a different search.`}
            />
          ) : (
            <EmptyState
              icon="UtensilsCrossed"
              title={
                activeCategory
                  ? `No items in ${resolveText(activeCategory.localizedName, "en")} yet`
                  : "Menu coming soon"
              }
              description="Items for this menu haven't been added yet. Please check back soon."
            />
          )
        ) : (
          grouped.map((group) => (
            <section key={group.category.id}>
              <h2 className="mb-3 font-heading text-h3 font-bold text-text-primary">
                {resolveText(group.category.localizedName, "en")}
              </h2>
              <div className="flex flex-col gap-3">
                {group.items.map((product) => (
                  <MenuProductCard
                    key={product.id}
                    restaurantSlug={restaurantSlug}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
