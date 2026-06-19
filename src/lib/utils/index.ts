export { cn } from "./cn";

/** Format a price in a currency, falling back gracefully. */
export function formatPrice(
  amount: number | null | undefined,
  currency = "USD",
  locale = "en-US",
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Format an ISO date string for display. Returns a placeholder when missing. */
export function formatDate(
  iso: string | null | undefined,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Convert a human label into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Stable id generator usable on server and client. */
export function createId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${rand}`;
}

/** Title-case a kebab/snake/space separated string. */
export function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
