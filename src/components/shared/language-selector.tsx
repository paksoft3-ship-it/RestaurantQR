"use client";

import { useLocale } from "@/lib/i18n/locale-provider";
import { LOCALE_META } from "@/lib/i18n/locales";
import { appConfig } from "@/lib/config/app-config";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

/** Accessible locale switcher. Updates lang/dir and persists the choice. */
export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <label className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon name="Globe" className="size-4 text-text-secondary" aria-hidden />
      <span className="sr-only">Select language</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
        className="cursor-pointer rounded-[10px] border border-border bg-canvas px-2 py-1 text-small text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
      >
        {appConfig.supportedLocales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_META[code].nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
