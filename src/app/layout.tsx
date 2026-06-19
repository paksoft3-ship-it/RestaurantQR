import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { appConfig } from "@/lib/config/app-config";
import { DEFAULT_LOCALE, dirForLocale } from "@/lib/i18n/locales";
import { LocaleProvider } from "@/lib/i18n/locale-provider";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.baseUrl),
  title: {
    default: `${appConfig.appName} — Managed QR & NFC Restaurant Platform`,
    template: `%s · ${appConfig.appName}`,
  },
  description:
    "A fully managed QR and NFC restaurant platform: branded restaurant pages, digital menus and managed updates.",
  applicationName: appConfig.appName,
  openGraph: {
    images: ["/images/brand/og-default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = DEFAULT_LOCALE;
  return (
    <html lang={locale} dir={dirForLocale(locale)} className={`${fontVariables} h-full`}>
      <body className="min-h-full">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
