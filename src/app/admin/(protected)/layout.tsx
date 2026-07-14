import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { permissionsForRole } from "@/domain/permissions";
import { routes } from "@/lib/routes";
import { isDemoMode } from "@/lib/config/app-config";
import { ToastProvider } from "@/components/ui/toast";
import { AdminUserProvider } from "@/components/admin/admin-user-context";
import { AdminStoreProvider } from "@/components/admin/admin-store-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Icon } from "@/components/shared/icon";
import { isDatabaseConfigured } from "@/data/db/client";
import { loadAdminSnapshot } from "@/data/admin/actions";
import type { AdminSnapshot } from "@/data/admin/types";
import type { AdminUser } from "@/domain/entities";

export const metadata: Metadata = {
  title: "Admin · YourPlatform",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentAdminUser();
  if (!current) redirect(`${routes.admin.login()}?reason=auth`);

  // When a database is configured, load the admin data once here and hand it to
  // the store provider to hydrate the client cache (writes persist to the DB).
  const dbBacked = isDatabaseConfigured();
  const snapshot: AdminSnapshot | null = dbBacked ? await loadAdminSnapshot() : null;

  // Pass a plain, serializable user to client components. Resolve effective
  // permissions here so the client never recomputes against the role table.
  const user: AdminUser = {
    id: current.id,
    displayName: current.displayName,
    email: current.email,
    role: current.role,
    status: current.status,
    permissions:
      current.permissions.length > 0 ? current.permissions : permissionsForRole(current.role),
  };

  return (
    <ToastProvider>
      <AdminUserProvider user={user}>
      <AdminStoreProvider dbBacked={dbBacked} snapshot={snapshot}>
      <div className="flex min-h-dvh bg-surface">
        <AdminSidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar user={user} />
          {isDemoMode ? (
            <div className="flex items-center justify-center gap-2 border-b border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-warning">
              <Icon name="FlaskConical" className="size-3.5" aria-hidden />
              Demo Mode — showing seed data. Set NEXT_PUBLIC_DEMO_MODE=false in production.
            </div>
          ) : null}
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      </AdminStoreProvider>
      </AdminUserProvider>
    </ToastProvider>
  );
}
