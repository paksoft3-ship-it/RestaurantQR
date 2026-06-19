import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/states";
import { MenuBrowser } from "@/components/restaurant/menu-browser";
import { restaurantMetadata } from "../metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const restaurant = await getRepositories().restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  const name = restaurant.displayName || restaurant.name;
  return restaurantMetadata(restaurant, {
    title: `Menu · ${name}`,
    description: `Browse the digital menu for ${name}.`,
  });
}

export default async function MenuPage({ params }: PageProps) {
  const { restaurantSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const [categories, products] = await Promise.all([
    repos.menus.categories(restaurant.id),
    repos.menus.products(restaurant.id),
  ]);

  const activeCategories = categories.filter((c) => c.status === "active");
  const visibleProducts = products.filter((p) => p.availability !== "hidden");

  return (
    <Container className="py-6">
      <header className="mb-2">
        <h1 className="font-display text-h1 font-extrabold tracking-tight text-text-primary">
          Menu
        </h1>
        <p className="mt-1 text-small text-text-secondary">
          {restaurant.displayName || restaurant.name}
        </p>
      </header>

      {activeCategories.length === 0 || visibleProducts.length === 0 ? (
        <EmptyState
          icon="UtensilsCrossed"
          title="Menu coming soon"
          description="The digital menu for this restaurant hasn't been published yet. Please check back soon."
          className="mt-6"
        />
      ) : (
        <MenuBrowser
          restaurantSlug={restaurant.slug}
          categories={activeCategories}
          products={visibleProducts}
        />
      )}
    </Container>
  );
}
