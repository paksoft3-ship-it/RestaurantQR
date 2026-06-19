"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { buildFloatingActions } from "@/lib/restaurant-actions/buildRestaurantActions";
import type { RestaurantPublicActionData } from "@/lib/restaurant-actions/restaurantActionTypes";
import { trackRestaurantAction } from "@/lib/restaurant-actions/restaurantActionTracking";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useLocale } from "@/lib/i18n/locale-provider";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

/**
 * Floating "+" button that opens a vertical speed-dial of contact/social actions
 * above the fixed action bar. Only configured actions are shown. Closes on
 * outside click, Escape, route change, or action select.
 */
export function RestaurantFloatingContactMenu({
  actions,
}: {
  actions: RestaurantPublicActionData;
}) {
  const t = useTranslations();
  const { locale } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const keyboardOpenRef = useRef(false);
  const menuId = useId();

  const items = buildFloatingActions(actions);

  const close = useCallback(
    (returnFocus = false) => {
      setOpen((wasOpen) => {
        if (wasOpen) {
          trackRestaurantAction("restaurant_contact_menu_closed", {
            restaurantId: actions.restaurantId,
            restaurantSlug: actions.restaurantSlug,
            actionType: "contact-menu",
            placement: "floating_contact_menu",
            locale,
          });
        }
        return false;
      });
      if (returnFocus) buttonRef.current?.focus();
    },
    [actions.restaurantId, actions.restaurantSlug, locale],
  );

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Move focus to the first action when opened via keyboard.
  useEffect(() => {
    if (open && keyboardOpenRef.current) {
      firstItemRef.current?.focus();
      keyboardOpenRef.current = false;
    }
  }, [open]);

  if (items.length === 0) return null;

  const toggle = (viaKeyboard: boolean) => {
    if (open) {
      close(viaKeyboard);
    } else {
      keyboardOpenRef.current = viaKeyboard;
      setOpen(true);
      trackRestaurantAction("restaurant_contact_menu_opened", {
        restaurantId: actions.restaurantId,
        restaurantSlug: actions.restaurantSlug,
        actionType: "contact-menu",
        placement: "floating_contact_menu",
        locale,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50 ltr:right-4 rtl:left-4 md:ltr:right-6 md:rtl:left-6"
      style={{
        bottom:
          "calc(var(--restaurant-action-bar-height, 76px) + env(safe-area-inset-bottom) + 16px)",
      }}
    >
      {/* Speed dial — expands upward */}
      <ul
        id={menuId}
        aria-label={t("rb.openContacts")}
        className={cn(
          "absolute bottom-full mb-3 flex flex-col items-end gap-2.5 ltr:right-0 rtl:left-0 transition-all duration-200",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {items.map((item, index) => (
          <li
            key={item.key}
            className={cn(
              "transition-all duration-200 motion-reduce:transition-none",
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
            style={{ transitionDelay: open ? `${index * 30}ms` : "0ms" }}
          >
            <a
              ref={index === 0 ? firstItemRef : undefined}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              tabIndex={open ? 0 : -1}
              onClick={() => {
                trackRestaurantAction("restaurant_contact_action_clicked", {
                  restaurantId: actions.restaurantId,
                  restaurantSlug: actions.restaurantSlug,
                  actionType: item.key,
                  placement: "floating_contact_menu",
                  locale,
                  destinationType: item.external ? "external" : item.key === "call" ? "phone" : "mailto",
                });
                close();
              }}
              className="flex items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="whitespace-nowrap rounded-full border border-border bg-canvas px-3 py-1.5 text-small font-semibold text-text-primary shadow-card">
                {t(item.labelKey)}
                {item.external ? <span className="sr-only"> — {t("rb.opensExternal")}</span> : null}
              </span>
              <span className="flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lift">
                <Icon name={item.icon} className="size-5" aria-hidden />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => toggle(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle(true);
          }
        }}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t("rb.closeContacts") : t("rb.openContacts")}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform duration-200 hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 ltr:ml-auto rtl:mr-auto"
      >
        <Icon
          name={open ? "X" : "Plus"}
          className={cn("size-7 transition-transform duration-200", open && "rotate-90")}
          aria-hidden
        />
      </button>
    </div>
  );
}
