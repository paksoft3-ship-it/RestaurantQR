import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { routes } from "@/lib/routes";
import { authConfig } from "@/lib/auth/config";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Account · YourPlatform",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Account"
        description="Manage your admin sign-in credentials."
        breadcrumb={[{ label: "Admin", href: routes.admin.dashboard() }, { label: "Account" }]}
      />
      <ChangePasswordForm realAuth={authConfig.authMode === "real"} />
    </div>
  );
}
