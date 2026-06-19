import type { Metadata } from "next";
import { getLegalPage } from "@/content/legal";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { CookiePreferences } from "@/components/legal/cookie-preferences";
import { appConfig } from "@/lib/config/app-config";

export const metadata: Metadata = {
  title: `Cookie Policy & Preferences · ${appConfig.appName}`,
  description:
    "How YourPlatform uses cookies, the categories involved, and how to manage your cookie preferences.",
};

export default function CookiesPage() {
  const page = getLegalPage("cookies");
  return (
    <LegalPageLayout
      page={page}
      intro="How we use cookies and similar technologies, and how to manage your choices. Optional cookies stay off until you opt in."
    >
      <CookiePreferences />
    </LegalPageLayout>
  );
}
