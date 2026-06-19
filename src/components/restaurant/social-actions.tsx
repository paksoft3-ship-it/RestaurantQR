import type { CustomerAction } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ACTION_ICON, resolveActionLink } from "./action-link";

interface SocialActionsProps {
  actions: CustomerAction[];
  className?: string;
  /** Save-contact vCard download href (data: URL), if available. */
  saveContactHref?: string | null;
  saveContactFilename?: string;
}

/**
 * Secondary contact + social actions row (WhatsApp, email, Instagram,
 * save-contact). Phone/menu/map live in the primary grid; this surfaces the
 * remaining touch points. Each is an icon + text link with a ≥44px target.
 * Disabled actions render as a non-link affordance rather than a broken link.
 */
export function SocialActions({
  actions,
  className,
  saveContactHref,
  saveContactFilename = "contact.vcf",
}: SocialActionsProps) {
  const social = actions.filter(
    (action) =>
      action.enabled &&
      (action.type === "whatsapp" ||
        action.type === "email" ||
        action.type === "instagram"),
  );

  const hasSaveContact = Boolean(saveContactHref);

  if (social.length === 0 && !hasSaveContact) return null;

  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {social.map((action) => {
        const label = resolveText(action.label, "en");
        const { href, external } = resolveActionLink(action);
        const icon = ACTION_ICON[action.type];

        const inner = (
          <>
            <Icon name={icon} className="size-5 text-primary" aria-hidden />
            <span className="text-small font-semibold">{label}</span>
          </>
        );

        const classes =
          "flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-border bg-canvas px-3 text-text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

        if (!href) {
          return (
            <li key={action.id}>
              <span
                className={cn(classes, "opacity-60")}
                aria-disabled="true"
                title="Not yet configured"
              >
                {inner}
              </span>
            </li>
          );
        }

        return (
          <li key={action.id}>
            <a
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={classes}
            >
              {inner}
            </a>
          </li>
        );
      })}

      {hasSaveContact ? (
        <li>
          <a
            href={saveContactHref ?? undefined}
            download={saveContactFilename}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-[12px] border border-border bg-canvas px-3 text-text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon name="UserPlus" className="size-5 text-primary" aria-hidden />
            <span className="text-small font-semibold">Save contact</span>
          </a>
        </li>
      ) : null}
    </ul>
  );
}
