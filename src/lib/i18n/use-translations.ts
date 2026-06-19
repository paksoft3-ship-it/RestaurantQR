"use client";

import { useCallback } from "react";
import { useLocale } from "./locale-provider";
import { translate } from "./dictionaries";

/** Client-side translation helper bound to the active locale. */
export function useTranslations() {
  const { locale } = useLocale();
  return useCallback((key: string) => translate(locale, key), [locale]);
}
