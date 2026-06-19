import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { resolveText } from "@/lib/i18n/locales";
import { Container } from "@/components/shared/container";
import { ProductDetail } from "@/components/restaurant/product-detail";
import { restaurantMetadata } from "../../metadata";

interface PageProps {
  params: Promise<{ restaurantSlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurantSlug, productSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) return {};
  const product = await repos.menus.productBySlug(restaurant.id, productSlug);
  if (!product) return {};

  const name = resolveText(product.localizedName, "en");
  const description = resolveText(product.localizedDescription, "en");
  return restaurantMetadata(restaurant, {
    title: `${name} · ${restaurant.displayName || restaurant.name}`,
    description: description || `${name} at ${restaurant.displayName || restaurant.name}.`,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { restaurantSlug, productSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const [product, actions] = await Promise.all([
    repos.menus.productBySlug(restaurant.id, productSlug),
    repos.menus.customerActions(restaurant.id),
  ]);
  if (!product) notFound();

  return (
    <Container className="py-6">
      <ProductDetail restaurantSlug={restaurant.slug} product={product} actions={actions} />
    </Container>
  );
}
