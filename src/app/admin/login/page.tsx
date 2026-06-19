import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { isDemoMode } from "@/lib/config/app-config";
import { Icon } from "@/components/shared/icon";
import { LanguageSelector } from "@/components/shared/language-selector";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Sign In · YourPlatform",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{ reason?: string }>;
}

const REASON_BANNERS: Record<string, { intent: "info" | "warning"; message: string }> = {
  auth: { intent: "warning", message: "Your session expired. Please sign in again." },
  "signed-out": { intent: "info", message: "You have been signed out." },
  unauthorized: {
    intent: "warning",
    message: "You do not have access to that area. Sign in with an authorized account.",
  },
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentAdminUser();
  if (user) redirect(routes.admin.dashboard());

  const { reason } = await searchParams;
  const banner = reason ? REASON_BANNERS[reason] : undefined;

  return (
    <main className="flex min-h-dvh flex-col bg-navy-deep text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-white">
            <Icon name="QrCode" className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-button font-bold">YourPlatform</span>
        </div>
        <LanguageSelector className="text-white [&_select]:border-white/20 [&_select]:bg-white/10 [&_select]:text-white" />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[20px] border border-white/10 bg-canvas p-6 shadow-lift sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-surface-warm text-primary">
                <Icon name="ShieldCheck" className="size-6" aria-hidden />
              </span>
              <h1 className="font-display text-h2 text-text-primary">Admin Console</h1>
              <p className="text-small text-text-secondary">
                Authorized YourPlatform team access only.
              </p>
            </div>

            {banner ? (
              <div
                role="status"
                className={
                  banner.intent === "warning"
                    ? "mb-4 flex items-start gap-2 rounded-[12px] border border-warning/30 bg-warning/5 p-3 text-small text-warning"
                    : "mb-4 flex items-start gap-2 rounded-[12px] border border-info/30 bg-info/5 p-3 text-small text-info"
                }
              >
                <Icon
                  name={banner.intent === "warning" ? "AlertTriangle" : "Info"}
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>{banner.message}</span>
              </div>
            ) : null}

            {isDemoMode ? (
              <div className="mb-4 rounded-[12px] border border-accent/40 bg-accent/10 p-3 text-small text-text-secondary">
                <p className="font-semibold text-text-primary">Demo mode</p>
                <p className="mt-0.5">
                  Use <code className="rounded bg-surface px-1">admin@yourplatform.test</code> /{" "}
                  <code className="rounded bg-surface px-1">demo1234</code> to explore the console.
                </p>
              </div>
            ) : null}

            <LoginForm />
          </div>

          <div className="mt-5 flex flex-col items-center gap-3 text-center text-small text-white/60">
            <p className="flex items-center gap-1.5">
              <Icon name="Lock" className="size-3.5" aria-hidden />
              Secured session. Activity may be monitored for security.
            </p>
            <Link
              href={routes.marketing.home()}
              className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 font-medium text-white hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Icon name="ArrowLeft" className="size-4" aria-hidden />
              Return to the public website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
