import {
  RESTAURANT_TYPES,
  SERVICE_MODELS,
  STRUCTURE_TYPES,
  VISUAL_DIRECTIONS,
  OPERATIONAL_STATUSES,
  SETUP_STATUSES,
  PROJECT_STATUSES,
} from "@/domain/enums";
import { SUPPORTED_LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/locales";
import { titleCase } from "@/lib/utils";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

function toOptions<T extends string>(values: readonly T[]): Option<T>[] {
  return values.map((value) => ({ value, label: titleCase(value) }));
}

export const restaurantTypeOptions = toOptions(RESTAURANT_TYPES);
export const serviceModelOptions = toOptions(SERVICE_MODELS);
export const structureTypeOptions = toOptions(STRUCTURE_TYPES);
export const visualDirectionOptions = toOptions(VISUAL_DIRECTIONS);
export const operationalStatusOptions = toOptions(OPERATIONAL_STATUSES);
export const setupStatusOptions = toOptions(SETUP_STATUSES);
export const projectStatusOptions = toOptions(PROJECT_STATUSES);

export const localeOptions: Option<Locale>[] = SUPPORTED_LOCALES.map((code) => ({
  value: code,
  label: LOCALE_META[code].label,
}));

/** Suggested cuisines (free-text chips can extend this). */
export const cuisineSuggestions = [
  "Italian",
  "American",
  "Turkish",
  "Mediterranean",
  "Healthy",
  "Vegetarian",
  "Seafood",
  "Cafe",
  "Bakery",
  "Mexican",
  "Asian",
  "BBQ",
];

/** Internal team labels used for assignment. */
export const teamSuggestions = ["Setup", "Design", "Menu", "Support", "Operations"];

/** Common timezones for the timezone selector. */
export const timezoneOptions: Option[] = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Istanbul",
  "Asia/Dubai",
].map((tz) => ({ value: tz, label: tz }));
