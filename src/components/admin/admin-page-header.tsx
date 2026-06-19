import { AdminBreadcrumb, type Crumb } from "./admin-breadcrumb";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
  actions?: React.ReactNode;
}

/** Standard admin page header: breadcrumb, title, description and actions slot. */
export function AdminPageHeader({ title, description, breadcrumb, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-1.5">
        {breadcrumb && breadcrumb.length > 0 ? <AdminBreadcrumb items={breadcrumb} /> : null}
        <h1 className="font-display text-h1 text-text-primary">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-body text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
