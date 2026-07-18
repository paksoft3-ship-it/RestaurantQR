import { notFound } from "next/navigation";
import { getRepositories } from "@/data/repositories";
import { getCurrentAdminUser } from "@/lib/auth";
import { maintenanceActive } from "@/lib/maintenance";
import { MaintenanceScreen } from "@/components/shared/maintenance-screen";
import { ToastProvider } from "@/components/ui/toast";
import { RestaurantPublicHeader } from "@/components/restaurant/restaurant-public-header";
import { RestaurantFooter } from "@/components/restaurant/restaurant-footer";
import { RestaurantPublicActionShell } from "@/components/restaurant/public/RestaurantPublicActionShell";
import { PageViewTracker } from "@/components/restaurant/public/PageViewTracker";
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
  if (await maintenanceActive()) return <MaintenanceScreen />;
  const repos = getRepositories();
  const restaurant = await repos.restaurants.getBySlug(restaurantSlug);
  if (!restaurant) notFound();

  // Publishing gate: unpublished restaurants (draft / archived) are hidden from
  // the public. A logged-in admin can still open the
  // page to preview it before going live.
  const isPublished = restaurant.publishingStatus === "published";
  const adminPreview = isPublished ? false : Boolean(await getCurrentAdminUser());
  if (!isPublished && !adminPreview) notFound();

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
        {adminPreview ? (
          <div className="bg-warning/15 px-4 py-2 text-center text-xs font-semibold text-warning">
            Admin preview — this restaurant is {restaurant.publishingStatus} and not visible to the
            public yet. Publish it to make it live.
          </div>
        ) : null}
        <RestaurantPublicHeader restaurant={restaurant} logoUrl={branding?.logo} />
        <main className="flex-1">{children}</main>
        <RestaurantFooter restaurant={restaurant} />
        <RestaurantPublicActionShell actions={publicActions} />
        {isPublished ? <PageViewTracker restaurantId={restaurant.id} slug={restaurant.slug} /> : null}
      </div>
    </ToastProvider>
  );
}
