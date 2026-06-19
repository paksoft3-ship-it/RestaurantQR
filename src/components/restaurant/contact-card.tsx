import type { CustomerAction } from "@/domain/entities";
import { resolveText } from "@/lib/i18n/locales";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { resolveActionLink } from "./action-link";

interface ContactCardProps {
  actions: CustomerAction[];
  className?: string;
}

interface ContactRow {
  id: string;
  icon: string;
  label: string;
  value: string;
  href: string;
  external: boolean;
}

/**
 * Read-only contact methods (phone, WhatsApp, email) rendered as tappable
 * rows. Only configured actions appear — we never fabricate a contact value.
 */
export function ContactCard({ actions, className }: ContactCardProps) {
  const rows: ContactRow[] = [];

  for (const action of actions) {
    if (!action.enabled) continue;
    if (action.type !== "call-order" && action.type !== "whatsapp" && action.type !== "email") {
      continue;
    }
    const { href, external } = resolveActionLink(action);
    if (!href) continue;

    const icon =
      action.type === "call-order" ? "Phone" : action.type === "whatsapp" ? "MessageCircle" : "Mail";
    const label =
      action.type === "call-order" ? "Call" : action.type === "whatsapp" ? "WhatsApp" : "Email";

    rows.push({
      id: action.id,
      icon,
      label,
      value: action.destination ?? resolveText(action.label, "en"),
      href,
      external,
    });
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "rounded-[16px] border border-border bg-canvas p-5 text-small text-text-secondary shadow-card",
          className,
        )}
      >
        Contact details to be confirmed.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-canvas shadow-card",
        className,
      )}
    >
      {rows.map((row) => (
        <a
          key={row.id}
          href={row.href}
          {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex min-h-[56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-warm text-primary">
            <Icon name={row.icon} className="size-5" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              {row.label}
            </span>
            <span className="truncate text-body font-semibold text-text-primary">{row.value}</span>
          </span>
          <Icon name="ChevronRight" className="size-5 shrink-0 text-text-tertiary" aria-hidden />
        </a>
      ))}
    </div>
  );
}
