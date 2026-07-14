import Link from "next/link";
import type { CustomerAction } from "@/domain/entities";
import type { CustomerActionType } from "@/domain/enums";
import { resolveText } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { ActionIcon } from "@/components/restaurant/public/ActionIcon";
import { ACTION_ICON, primaryActions, resolveActionLink } from "./action-link";

interface RestaurantActionGridProps {
  actions: CustomerAction[];
}

/** Visual emphasis: the lead actions are filled, the rest outlined. */
const FILLED: Record<CustomerActionType, "primary" | "dark" | "outline"> = {
  "call-order": "primary",
  "pick-your-meal": "dark",
  "online-order": "outline",
  "visit-us": "outline",
  whatsapp: "outline",
  "save-contact": "outline",
  email: "outline",
  instagram: "outline",
  share: "outline",
  custom: "outline",
};

const TILE_STYLE = {
  primary: "bg-primary text-white border-transparent shadow-card",
  dark: "bg-navy text-white border-transparent shadow-card",
  outline: "bg-canvas text-text-primary border-border [&_svg]:text-primary",
} as const;

/**
 * The four primary customer actions in a bold 2×2 grid. Each tile is a large
 * (≥44px) touch target with an icon and a clear text label. "Online Order with
 * Pay" opens externally; "Visit Us" opens a map; "Call Order" dials.
 */
export function RestaurantActionGrid({ actions }: RestaurantActionGridProps) {
  const items = primaryActions(actions);
  if (items.length === 0) return null;

  return (
    <nav aria-label="Primary actions" className="grid grid-cols-2 gap-3">
      {items.map((action) => {
        // Top cards use their own label/icon when set, else fall back to the
        // shared (bottom-bar) values. The link is always shared.
        const label = resolveText(action.topLabel ?? action.label, "en");
        const iconOverride = action.topIcon?.trim() || action.icon?.trim() || "";
        const { href, external } = resolveActionLink(action);
        const variant = FILLED[action.type];

        const inner = (
          <>
            <ActionIcon
              icon={iconOverride}
              fallbackIcon={ACTION_ICON[action.type]}
              size={32}
              className="size-8"
              imgClassName="size-8"
            />
            <span className="text-button font-bold">{label}</span>
          </>
        );

        const classes = cn(
          "flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-[16px] border p-4 text-center transition-transform active:scale-[0.98]",
          TILE_STYLE[variant],
        );

        if (!href) {
          return (
            <span
              key={action.id}
              className={cn(classes, "opacity-60")}
              aria-disabled="true"
              title="This action is not yet configured"
            >
              {inner}
            </span>
          );
        }

        if (external) {
          return (
            <a
              key={action.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={classes}
            >
              {inner}
            </a>
          );
        }

        // tel:/mailto: links and internal app links.
        const isProtocol = href.startsWith("tel:") || href.startsWith("mailto:");
        if (isProtocol) {
          return (
            <a key={action.id} href={href} className={classes}>
              {inner}
            </a>
          );
        }

        return (
          <Link key={action.id} href={href} className={classes}>
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
