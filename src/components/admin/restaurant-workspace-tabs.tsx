"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface RestaurantWorkspaceTabsProps {
  restaurantId: string;
}

interface TabDef {
  label: string;
  href: string;
  icon: string;
  partTwo?: boolean;
}

/**
 * Horizontally scrollable workspace tab bar. Overview/General/Branding are live;
 * Part 2 tabs link to placeholder routes within the workspace.
 */
export function RestaurantWorkspaceTabs({ restaurantId }: RestaurantWorkspaceTabsProps) {
  const pathname = usePathname();

  const base = routes.admin.restaurant(restaurantId);
  const tabs: TabDef[] = [
    { label: "Overview", href: base, icon: "LayoutDashboard" },
    { label: "General", href: routes.admin.restaurantGeneral(restaurantId), icon: "Settings" },
    { label: "Branding", href: routes.admin.restaurantBranding(restaurantId), icon: "Palette" },
    { label: "Contact", href: routes.admin.restaurantContact(restaurantId), icon: "MapPin" },
    { label: "Hours", href: routes.admin.restaurantHours(restaurantId), icon: "Clock" },
    { label: "Menu", href: routes.admin.restaurantMenu(restaurantId), icon: "BookOpen" },
    { label: "Media", href: routes.admin.restaurantMedia(restaurantId), icon: "Image" },
    { label: "Actions", href: routes.admin.restaurantActions(restaurantId), icon: "MousePointerClick" },
    { label: "QR Codes", href: routes.admin.restaurantQr(restaurantId), icon: "QrCode" },
    { label: "NFC", href: routes.admin.restaurantNfc(restaurantId), icon: "Nfc" },
    { label: "Campaigns", href: routes.admin.restaurantCampaigns(restaurantId), icon: "Megaphone" },
    { label: "Analytics", href: routes.admin.restaurantAnalytics(restaurantId), icon: "ChartColumn" },
    { label: "Page Builder", href: routes.admin.restaurantPageBuilder(restaurantId), icon: "LayoutTemplate" },
  ];

  return (
    <div className="-mx-1 overflow-x-auto">
      <nav
        className="flex min-w-max gap-1 border-b border-border px-1"
        aria-label="Restaurant workspace"
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              <Icon name={tab.icon} className="size-4" aria-hidden />
              {tab.label}
              {tab.partTwo ? (
                <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
                  P2
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
