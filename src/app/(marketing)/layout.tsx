import { PublicHeader } from "@/components/marketing/public-header";
import { PublicFooter } from "@/components/marketing/public-footer";
import { ToastProvider } from "@/components/ui/toast";
import { CookieNotice } from "@/components/legal/cookie-notice";
import { MaintenanceScreen } from "@/components/shared/maintenance-screen";
import { maintenanceActive } from "@/lib/maintenance";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  if (await maintenanceActive()) return <MaintenanceScreen />;
  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col bg-canvas">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <CookieNotice />
      </div>
    </ToastProvider>
  );
}
