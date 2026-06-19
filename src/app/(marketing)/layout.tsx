import { PublicHeader } from "@/components/marketing/public-header";
import { PublicFooter } from "@/components/marketing/public-footer";
import { ToastProvider } from "@/components/ui/toast";
import { CookieNotice } from "@/components/legal/cookie-notice";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
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
