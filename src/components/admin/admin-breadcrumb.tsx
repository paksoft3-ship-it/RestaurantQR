import Link from "next/link";
import { Icon } from "@/components/shared/icon";

export interface Crumb {
  label: string;
  href?: string;
}

/** Accessible admin breadcrumb trail. The last crumb is the current page. */
export function AdminBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-small text-text-secondary">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-[6px] px-0.5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-semibold text-text-primary" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <Icon name="ChevronRight" className="size-3.5 text-text-tertiary" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
