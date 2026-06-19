/** Central locale type and helpers. German is prepared but not yet enabled. */

export const LOCALES = ["en", "tr", "ar", "de"] as const;
export type Locale = (typeof LOCALES)[number];

export const SUPPORTED_LOCALES: Locale[] = ["en", "tr", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: Locale[] = ["ar"];

export interface LocaleMeta {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  tr: { code: "tr", label: "Turkish", nativeLabel: "Türkçe", dir: "ltr" },
  ar: { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  de: { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirForLocale(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** A value that may carry translations keyed by locale, always with English. */
export type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

/** Resolve localized text with safe fallback to the default locale. */
export function resolveText(
  text: LocalizedText | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (text === null || text === undefined) return "";
  if (typeof text === "string") return text;
  return text[locale] ?? text[DEFAULT_LOCALE] ?? text.en ?? "";
}
