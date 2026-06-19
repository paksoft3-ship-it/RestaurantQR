import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface AdminSectionProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/** A calm titled content section used across admin work surfaces. */
export function AdminSection({
  title,
  description,
  icon,
  actions,
  children,
  className,
  id,
}: AdminSectionProps) {
  return (
    <section
      id={id}
      className={cn("rounded-[16px] border border-border bg-canvas shadow-card", className)}
    >
      <header className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-warm text-primary">
              <Icon name={icon} className="size-5" aria-hidden />
            </span>
          ) : null}
          <div>
            <h2 className="font-heading text-h3 text-text-primary">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-small text-text-secondary">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
