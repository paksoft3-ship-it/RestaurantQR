import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { ToastProvider } from "@/components/ui/toast";
import { RestaurantPublicHeader } from "@/components/restaurant/restaurant-public-header";
import { RestaurantFooter } from "@/components/restaurant/restaurant-footer";
import { RestaurantPublicActionShell } from "@/components/restaurant/public/RestaurantPublicActionShell";
import { buildRestaurantPublicActions } from "@/lib/restaurant-actions/buildRestaurantActions";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

interface RestaurantLayoutProps {
  children: React.ReactNode;
  params: Promise<{ restaurantSlug: string }>;
}

/**
 * Restaurant public shell: sticky identity header, the page content centered in
 * a mobile-first shell, a dark footer, and — mounted once here — the fixed
 * four-action bottom bar + floating contact menu. The whole tree is wrapped in a
 * ToastProvider so client interactions can surface feedback.
 *
 * `.restaurant-public-shell` adds bottom spacing (action bar height + safe area)
 * so the fixed bar never covers content.
 */
export default async function RestaurantLayout({ children, params }: RestaurantLayoutProps) {
  const { restaurantSlug } = await params;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  const [actions, locations, branding] = await Promise.all([
    repos.menus.customerActions(restaurant.id),
    repos.restaurants.locations(restaurant.id),
    repos.branding.get(restaurant.id),
  ]);
  const publicActions = buildRestaurantPublicActions(
    restaurant,
    actions,
    locations[0] ?? null,
    DEFAULT_LOCALE,
  );

  // Apply the restaurant's brand colors as scoped CSS variables (falls back to
  // the default design tokens when branding is absent).
  const brandStyle = branding?.colors
    ? ({
        "--color-primary": branding.colors.primary,
        "--color-primary-dark": branding.colors.primaryDark,
        "--color-accent": branding.colors.accent,
        "--color-surface": branding.colors.surface,
        "--color-text-primary": branding.colors.text,
      } as React.CSSProperties)
    : undefined;

  return (
    <ToastProvider>
      <div className="restaurant-public-shell flex min-h-dvh flex-col bg-canvas" style={brandStyle}>
        <RestaurantPublicHeader restaurant={restaurant} logoUrl={branding?.logo} />
        <main className="flex-1">{children}</main>
        <RestaurantFooter restaurant={restaurant} />
        <RestaurantPublicActionShell actions={publicActions} />
      </div>
    </ToastProvider>
  );
}
