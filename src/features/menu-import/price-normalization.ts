/**
 * Price text normalization. Deterministic, dependency-free and unit-tested.
 * Handles the formats listed in the spec (240, "240 TL", "240 ₺", "₺240",
 * "240,00", "240.00", "240,-", "240 / 310", "M 240 L 310", etc.).
 *
 * It never silently converts currencies and flags ambiguity via confidence.
 */

const CURRENCY_BY_SYMBOL: Record<string, string> = {
  "₺": "TRY",
  TL: "TRY",
  "€": "EUR",
  "$": "USD",
  "£": "GBP",
};

export interface ParsedPrice {
  amount: number;
  currency: string | null;
  originalText: string;
  confidence: number;
}

export interface ParsePriceOptions {
  defaultCurrency?: string | null;
}

function detectCurrency(text: string): string | null {
  for (const [symbol, code] of Object.entries(CURRENCY_BY_SYMBOL)) {
    if (text.includes(symbol)) return code;
  }
  const m = text.match(/\b(TRY|EUR|USD|GBP)\b/i);
  return m ? m[1].toUpperCase() : null;
}

/** Normalize a single numeric token like "240,00" / "1.250,00" / "240,-" → number. */
function normalizeNumber(token: string): number | null {
  let t = token.replace(/[^0-9.,-]/g, "").trim();
  if (!t) return null;
  // "240,-" (trailing dash = .00)
  t = t.replace(/,-$/, "");
  const hasComma = t.includes(",");
  const hasDot = t.includes(".");
  if (hasComma && hasDot) {
    // The last separator is the decimal one.
    if (t.lastIndexOf(",") > t.lastIndexOf(".")) {
      t = t.replace(/\./g, "").replace(",", ".");
    } else {
      t = t.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Comma as decimal if it precedes exactly two digits, else thousands.
    t = /,\d{2}$/.test(t) ? t.replace(",", ".") : t.replace(/,/g, "");
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Parse the primary (base) price out of a price string. */
export function parsePrice(text: string, options: ParsePriceOptions = {}): ParsedPrice | null {
  const originalText = text.trim();
  if (!originalText) return null;

  const currency = detectCurrency(originalText) ?? options.defaultCurrency ?? null;
  // Grab numeric groups (supports "240 / 310", "M 240 L 310").
  const numberTokens: string[] = originalText.match(/\d[\d.,-]*/g) ?? [];
  const firstToken = numberTokens[0];
  if (!firstToken) return null;

  const amount = normalizeNumber(firstToken);
  if (amount === null) return null;

  // Confidence heuristics — deterministic, never random.
  let confidence = 0.95;
  if (!currency) confidence -= 0.15; // missing currency
  if (numberTokens.length > 1) confidence -= 0.1; // multiple values → variant ambiguity
  if (amount > 100000 || amount === 0) confidence -= 0.2; // suspicious magnitude
  confidence = Math.max(0, Math.round(confidence * 100) / 100);

  return { amount, currency, originalText, confidence };
}

/** Parse multiple variant prices from a string like "Medium 240 | Large 310". */
export function parseVariantPrices(
  text: string,
  options: ParsePriceOptions = {},
): { label: string | null; amount: number; currency: string | null }[] {
  const currency = detectCurrency(text) ?? options.defaultCurrency ?? null;
  const results: { label: string | null; amount: number; currency: string | null }[] = [];
  // Match "<label> <number>" pairs, falling back to bare numbers.
  const pairRegex = /([A-Za-zÇĞİÖŞÜçğıöşü]+)?\s*(\d[\d.,-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pairRegex.exec(text)) !== null) {
    const numberToken = match[2];
    if (!numberToken) continue;
    const amount = normalizeNumber(numberToken);
    if (amount === null) continue;
    const label = match[1]?.trim() || null;
    results.push({ label, amount, currency });
  }
  return results;
}

/** Common OCR digit/letter confusions, used to flag (not silently fix) values. */
export function detectOcrConfusion(text: string): { suspect: boolean; reason?: string } {
  if (/[IlO]\d|\d[IlO]/.test(text)) return { suspect: true, reason: "letter/number confusion (I/l/O)" };
  if (/[SB]\d{2,}/.test(text)) return { suspect: true, reason: "S/5 or B/8 confusion" };
  return { suspect: false };
}
