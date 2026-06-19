/** URL + phone safety helpers for public restaurant actions. */

const ALLOWED_WEB_PROTOCOLS = new Set(["https:", "http:"]);
const BLOCKED_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:"];

/** Normalize a phone string for a `tel:` URL (digits + leading +). */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[^\d+]/g, "");
  const digits = cleaned.replace(/\+/g, "");
  if (digits.length < 5) return null;
  return cleaned.startsWith("+") ? `+${digits}` : digits;
}

/** International digits only (no +, spaces, dashes) for a wa.me path. */
export function normalizeWhatsappDigits(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 6 ? digits : null;
}

/**
 * Validate an external web URL. Only http(s) allowed; production should be https.
 * Returns the URL string when safe, else null.
 */
export function safeWebUrl(
  value: string | null | undefined,
  { allowHttp = false }: { allowHttp?: boolean } = {},
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (BLOCKED_PROTOCOLS.some((p) => lower.startsWith(p))) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (!ALLOWED_WEB_PROTOCOLS.has(parsed.protocol)) return null;
  if (parsed.protocol === "http:" && !allowHttp) return null;
  return parsed.toString();
}

/** Build a safe wa.me URL from a number, or pass through a valid https wa link. */
export function buildWhatsappUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return safeWebUrl(trimmed, { allowHttp: true });
  const digits = normalizeWhatsappDigits(trimmed);
  return digits ? `https://wa.me/${digits}` : null;
}
