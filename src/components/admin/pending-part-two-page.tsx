import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSection } from "@/components/admin/admin-section";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { routes } from "@/lib/routes";
import type { Crumb } from "@/components/admin/admin-breadcrumb";

interface PendingPartTwoPageProps {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  icon?: string;
}

/**
 * Generic placeholder for admin routes whose full UI ships in Part 2.
 * Renders inside the admin shell with breadcrumb, title and a back action.
 */
export function PendingPartTwoPage({
  title,
  description,
  breadcrumb,
  icon = "Sparkles",
}: PendingPartTwoPageProps) {
  const crumbs: Crumb[] = breadcrumb ?? [
    { label: "Admin", href: routes.admin.dashboard() },
    { label: title },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={title}
        description={description ?? "This area is part of the YourPlatform admin."}
        breadcrumb={crumbs}
      />
      <AdminSection title="Coming in Part 2" icon={icon}>
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-warm px-3 py-1 text-small font-semibold text-primary">
            <Icon name="Clock" className="size-4" aria-hidden />
            Planned
          </span>
          <p className="max-w-xl text-body text-text-secondary">
            Design will be added in Part 2. The foundation, navigation and access controls for this
            section are in place, and the full workspace will be wired to its repository in the next
            phase.
          </p>
          <Button asChild variant="secondary">
            <Link href={routes.admin.dashboard()}>
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              Back to dashboard
            </Link>
          </Button>
        </div>
      </AdminSection>
    </div>
  );
}
