import type { Locale } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locales";

/**
 * Typed application configuration.
 *
 * Unverified business values stay blank and are surfaced through
 * `displayValue()` as "To be confirmed" rather than being invented.
 */

const UNCONFIGURED = "To be confirmed" as const;

function env(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseLocales(raw: string | undefined): Locale[] {
  if (!raw) return SUPPORTED_LOCALES;
  const parsed = raw
    .split(",")
    .map((part) => part.trim())
    .filter(isLocale);
  return parsed.length > 0 ? parsed : SUPPORTED_LOCALES;
}

export interface AppConfig {
  appName: string;
  baseUrl: string;
  demoMode: boolean;
  defaultLocale: Locale;
  supportedLocales: Locale[];
  support: {
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
  business: {
    address: string | null;
    workingHours: string | null;
    legalName: string | null;
    privacyContact: string | null;
  };
  social: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
  };
  formTransport: "mock" | "configured";
  analyticsMode: "off" | "mock" | "configured";
  features: {
    menuPdfImport: boolean;
  };
  menuImport: {
    maxFileSizeMb: number;
    maxPageCount: number;
    maxImageCount: number;
    confidenceHigh: number;
    confidenceMedium: number;
    workerConfigured: boolean;
    aiEnabled: boolean;
  };
}

function numEnv(key: string, fallback: number): number {
  const raw = env(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const appConfig: AppConfig = {
  appName: env("NEXT_PUBLIC_APP_NAME") ?? "YourPlatform",
  baseUrl: env("NEXT_PUBLIC_BASE_URL") ?? "http://localhost:3000",
  demoMode: env("NEXT_PUBLIC_DEMO_MODE") !== "false",
  defaultLocale: isLocale(env("NEXT_PUBLIC_DEFAULT_LOCALE") ?? "")
    ? (env("NEXT_PUBLIC_DEFAULT_LOCALE") as Locale)
    : DEFAULT_LOCALE,
  supportedLocales: parseLocales(env("NEXT_PUBLIC_SUPPORTED_LOCALES")),
  support: {
    email: env("NEXT_PUBLIC_SUPPORT_EMAIL") ?? null,
    phone: env("NEXT_PUBLIC_SUPPORT_PHONE") ?? null,
    whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER") ?? null,
  },
  business: {
    address: env("NEXT_PUBLIC_BUSINESS_ADDRESS") ?? null,
    workingHours: env("NEXT_PUBLIC_WORKING_HOURS") ?? null,
    legalName: env("NEXT_PUBLIC_LEGAL_COMPANY_NAME") ?? null,
    privacyContact: env("NEXT_PUBLIC_PRIVACY_CONTACT") ?? null,
  },
  social: {
    instagram: env("NEXT_PUBLIC_SOCIAL_INSTAGRAM") ?? null,
    facebook: env("NEXT_PUBLIC_SOCIAL_FACEBOOK") ?? null,
    linkedin: env("NEXT_PUBLIC_SOCIAL_LINKEDIN") ?? null,
  },
  formTransport: env("FORM_TRANSPORT") === "configured" ? "configured" : "mock",
  analyticsMode:
    env("ANALYTICS_MODE") === "configured"
      ? "configured"
      : env("ANALYTICS_MODE") === "off"
        ? "off"
        : "mock",
  features: {
    // Default ON in demo mode so the feature is explorable; gate server-side too.
    menuPdfImport: (env("NEXT_PUBLIC_MENU_PDF_IMPORT") ?? "true") !== "false",
  },
  menuImport: {
    maxFileSizeMb: numEnv("NEXT_PUBLIC_MENU_IMPORT_MAX_FILE_SIZE_MB", 25),
    maxPageCount: numEnv("NEXT_PUBLIC_MENU_IMPORT_MAX_PAGE_COUNT", 40),
    maxImageCount: numEnv("NEXT_PUBLIC_MENU_IMPORT_MAX_IMAGE_COUNT", 200),
    confidenceHigh: numEnv("NEXT_PUBLIC_MENU_IMPORT_CONFIDENCE_HIGH", 0.9),
    confidenceMedium: numEnv("NEXT_PUBLIC_MENU_IMPORT_CONFIDENCE_MEDIUM", 0.7),
    workerConfigured: env("MENU_IMPORT_WORKER_URL") !== undefined,
    aiEnabled: env("MENU_IMPORT_AI_ENABLED") === "true",
  },
};

/** Render a possibly-missing config value with a safe placeholder. */
export function displayValue(value: string | null | undefined, fallback: string = UNCONFIGURED): string {
  return value && value.length > 0 ? value : fallback;
}

export const isDemoMode = appConfig.demoMode;
