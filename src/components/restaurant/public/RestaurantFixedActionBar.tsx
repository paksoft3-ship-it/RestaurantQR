"use client";

import { usePathname } from "next/navigation";
import { buildFixedActions } from "@/lib/restaurant-actions/buildRestaurantActions";
import type { RestaurantPublicActionData } from "@/lib/restaurant-actions/restaurantActionTypes";
import { trackRestaurantAction } from "@/lib/restaurant-actions/restaurantActionTracking";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useLocale } from "@/lib/i18n/locale-provider";
import { RestaurantActionItem } from "./RestaurantActionItem";

const LABEL_KEY = {
  CALL_ORDER: "rb.callOrder",
  OPEN_MENU: "rb.pickMeal",
  EXTERNAL_ORDER: "rb.onlineOrder",
  ADD_CONTACT: "rb.addContact",
} as const;

/** Fixed bottom action bar: Call Order · Pick Your Meal · Online Order · Add Contact. */
export function RestaurantFixedActionBar({ actions }: { actions: RestaurantPublicActionData }) {
  const t = useTranslations();
  const { locale } = useLocale();
  const pathname = usePathname();
  const fixed = buildFixedActions(actions);
  const menuActive = pathname.startsWith(actions.menuUrl);

  const track = (actionType: string, event: Parameters<typeof trackRestaurantAction>[0], destinationType?: string) =>
    trackRestaurantAction(event, {
      restaurantId: actions.restaurantId,
      restaurantSlug: actions.restaurantSlug,
      actionType,
      placement: "fixed_bottom_bar",
      locale,
      destinationType,
    });

  return (
    <nav
      aria-label="Restaurant actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-canvas/95 shadow-[0_-2px_12px_rgba(16,24,40,0.06)] backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-shell items-stretch justify-around">
        {fixed.map((action) => {
          const label = t(LABEL_KEY[action.type]);
          switch (action.type) {
            case "CALL_ORDER":
              return (
                <RestaurantActionItem
                  key={action.type}
                  iconSrc={action.iconSrc}
                  label={label}
                  mode={action.available ? "tel" : "disabled"}
                  href={action.href}
                  unavailableLabel={t("rb.unavailable")}
                  onActivate={() => track("call-order", "restaurant_call_action_clicked", "phone")}
                />
              );
            case "OPEN_MENU":
              return (
                <RestaurantActionItem
                  key={action.type}
                  iconSrc={action.iconSrc}
                  label={label}
                  mode="internal"
                  href={action.href}
                  active={menuActive}
                  onActivate={() => track("pick-your-meal", "restaurant_menu_action_clicked", "internal")}
                />
              );
            case "EXTERNAL_ORDER":
              return (
                <RestaurantActionItem
                  key={action.type}
                  iconSrc={action.iconSrc}
                  label={label}
                  mode={action.available ? "external" : "disabled"}
                  href={action.href}
                  srHint={t("rb.opensExternal")}
                  unavailableLabel={t("rb.unavailable")}
                  onActivate={() => track("online-order", "restaurant_external_ordering_opened", "external")}
                />
              );
            case "ADD_CONTACT":
              return (
                <RestaurantActionItem
                  key={action.type}
                  iconSrc={action.iconSrc}
                  label={label}
                  mode={action.available ? "download" : "disabled"}
                  href={action.href}
                  downloadName={`${actions.restaurantSlug}-contact.vcf`}
                  unavailableLabel={t("rb.unavailable")}
                  onActivate={() => track("add-contact", "restaurant_vcard_downloaded", "download")}
                />
              );
            default:
              return null;
          }
        })}
      </ul>
    </nav>
  );
}
