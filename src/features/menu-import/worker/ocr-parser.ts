import {
  SCHEMA_VERSION,
  type CategoryCandidate,
  type ImportResult,
  type ImportWarning,
  type ProductCandidate,
  type StringField,
  type ImportVariant,
} from "@/domain/menu-import";
import { slugify } from "@/lib/utils";

/**
 * Pure OCR → ImportResult parser.
 *
 * Takes the raw per-page text produced by Tesseract and turns it into a
 * reviewable extraction draft. It is intentionally conservative: OCR of a dense,
 * scanned, multi-column menu is noisy, so every product is created at LOW name
 * confidence and flagged for human review. Prices (the most recoverable signal)
 * drive structure — a line is split into one "name → price" pair per price found,
 * which also recombines the two columns Tesseract merges onto a single line.
 *
 * Pure and DOM-free so it runs in the API route handler and is unit-testable.
 */

export interface OcrParserInput {
  importId: string;
  restaurantId: string;
  fileName: string;
  /** Raw OCR text, one entry per page (index 0 = page 1). */
  pages: string[];
  pageCount: number;
  pdfType: "text" | "scanned" | "mixed" | "unknown";
  /** Resolved currency code (never "auto"). */
  currency: string;
  defaultLanguage: string;
}

/** Matches a money amount with exactly two decimals: 10.25, 8,75, 12.49 */
const PRICE_RE = /(\d{1,3})[.,](\d{2})(?!\d)/g;

/** Lines that are size/column headers, not categories (e.g. "Sml 8" Giant 16" Pita Pocket"). */
const SIZE_HEADER_RE = /\b(sml|small|giant|pita\s*pocket)\b/i;

/** Phrases that signal a descriptive note / continuation line rather than a heading. */
const NOTE_HINTS = [
  "served",
  "comes with",
  "with sauce",
  "all grinders",
  "excludes",
  "includes",
  "lettuce",
  "tomato",
  "mayo",
  "onion",
  "cheese &",
];

const NAME_CONFIDENCE = 0.45; // OCR names always need review
const PRICE_CONFIDENCE = 0.7;
const CATEGORY_CONFIDENCE = 0.5;

const VOWELS = /[aeiouAEIOU]/g;

/**
 * A token is OCR "leader noise" (the garble Tesseract makes of dotted leaders,
 * e.g. "sicccssssvexarss", "0eee", "cesseseeen") when it has a run of 3+ identical
 * letters, or is a long low-vowel blob, or mixes digits into a word. Real menu
 * words ("Cheeseburger", "Mozzarella", "Grinders") do not trip these.
 */
function isLeaderNoise(token: string): boolean {
  if (token.length < 3) return false;
  if (/(.)\1\1/i.test(token)) return true; // sss, eee, ccc…
  const vowels = (token.match(VOWELS) ?? []).length;
  if (token.length >= 6 && vowels / token.length < 0.25) return true;
  if (token.length >= 5 && /\d/.test(token) && /[A-Za-z]/.test(token)) return true;
  return false;
}

/** Strip OCR leader-dot runs and stray punctuation; collapse whitespace. */
function cleanText(raw: string): string {
  const base = raw
    .replace(/[.…]{2,}/g, " ") // dotted leaders
    .replace(/\.+\s*$/g, " ")
    .replace(/[^A-Za-z0-9&/'’\-+ ]+/g, " ") // drop weird OCR symbols
    .replace(/\s+/g, " ")
    .trim();

  // Trim garbled leader-noise tokens from both ends (never the interior, so real
  // multi-word names survive). Stops at the first clean token.
  const tokens = base.split(" ");
  while (tokens.length && isLeaderNoise(tokens[tokens.length - 1])) tokens.pop();
  while (tokens.length && isLeaderNoise(tokens[0])) tokens.shift();
  return tokens.join(" ").trim();
}

/** A real product name needs a run of at least three letters. */
function looksLikeName(text: string): boolean {
  return /[A-Za-z]{3,}/.test(text);
}

/** Heuristic: does the cleaned (no-price) line read like a category heading? */
function looksLikeHeading(text: string): boolean {
  const lower = text.toLowerCase();
  if (text.length < 3 || text.length > 32) return false;
  if (text.split(/\s+/).length > 5) return false;
  if (SIZE_HEADER_RE.test(text)) return false;
  if (NOTE_HINTS.some((hint) => lower.includes(hint))) return false;
  // Headings are mostly letters (allow a trailing "& Sides" etc.).
  const letters = (text.match(/[A-Za-z]/g) ?? []).length;
  return letters >= text.length * 0.6;
}

function amountFromMatch(intPart: string, decPart: string): number {
  return Number.parseFloat(`${intPart}.${decPart}`);
}

function field(value: string, confidence: number, page: number): StringField {
  return {
    value,
    confidence,
    source: { page, method: "ocr", originalText: value },
    manuallyCorrected: false,
  };
}

interface WorkingProduct {
  name: string;
  amount: number;
  originalText: string;
  page: number;
  variants: ImportVariant[];
  nameQuestionable: boolean;
}

interface WorkingCategory {
  name: string;
  page: number;
  products: WorkingProduct[];
}

/** A name is "questionable" if it is very short or mostly non-letters (likely garbled). */
function isQuestionable(name: string): boolean {
  if (name.length < 3) return true;
  const letters = (name.match(/[A-Za-z]/g) ?? []).length;
  return letters < name.replace(/\s/g, "").length * 0.5;
}

export function parseOcrToResult(input: OcrParserInput): ImportResult {
  const { importId, restaurantId, fileName, pages, pageCount, pdfType, currency } = input;

  const categories: WorkingCategory[] = [];
  const uncategorized: WorkingProduct[] = [];
  let current: WorkingCategory | null = null;
  /** Variant labels carried from the most recent size-header line. */
  let sizeLabels: string[] = [];

  const pushProduct = (p: WorkingProduct) => {
    if (current) current.products.push(p);
    else uncategorized.push(p);
  };

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pi + 1;
    const lines = pages[pi].split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const matches = [...line.matchAll(PRICE_RE)];

      if (matches.length === 0) {
        // No price: a size header, a category heading, or a descriptive note.
        if (SIZE_HEADER_RE.test(line)) {
          sizeLabels = ['Giant 16"', "Pita Pocket"]; // 2nd/3rd price columns
          continue;
        }
        const heading = cleanText(line);
        if (looksLikeHeading(heading)) {
          current = { name: heading, page, products: [] };
          categories.push(current);
        }
        continue;
      }

      // One or more prices on the line → split into name→price segments.
      let cursor = 0;
      let last: WorkingProduct | null = null;
      let variantIndex = 0;
      for (const m of matches) {
        const start = m.index ?? 0;
        const segment = line.slice(cursor, start);
        cursor = start + m[0].length;
        const name = cleanText(segment);
        const amount = amountFromMatch(m[1], m[2]);

        if (looksLikeName(name)) {
          last = {
            name,
            amount,
            originalText: `${name} ${m[0]}`,
            page,
            variants: [],
            nameQuestionable: isQuestionable(name),
          };
          pushProduct(last);
          variantIndex = 0;
        } else if (last) {
          // Empty/garbled segment before a price → a size-column variant.
          const label = sizeLabels[variantIndex] ?? `Option ${variantIndex + 2}`;
          last.variants.push({
            name: label,
            price: { amount, currency },
            confidence: PRICE_CONFIDENCE,
          });
          variantIndex += 1;
        }
      }
    }
  }

  // ---- Build candidate result -------------------------------------------------

  const warnings: ImportWarning[] = [];
  let high = 0;
  let med = 0;
  let low = 0;
  const count = (c: number) => {
    if (c >= 0.9) high++;
    else if (c >= 0.7) med++;
    else low++;
  };

  let displayCat = 0;
  const buildProduct = (p: WorkingProduct, order: number): ProductCandidate => {
    count(NAME_CONFIDENCE);
    count(PRICE_CONFIDENCE);
    const candidateId = `item_${slugify(p.name) || "item"}_${order}`;
    const itemWarnings: string[] = [];
    if (p.nameQuestionable) {
      itemWarnings.push("PRODUCT_NAME_UNCLEAR");
      warnings.push({
        id: `w_name_${candidateId}`,
        entityType: "product",
        entityCandidateId: candidateId,
        field: "name",
        severity: "REVIEW",
        code: "PRODUCT_NAME_UNCLEAR",
        message: `The name "${p.name}" was read by OCR and may be garbled — please confirm.`,
        resolved: false,
      });
    }
    return {
      candidateId,
      proposedId: `item-${slugify(p.name) || candidateId}`,
      name: field(p.name, NAME_CONFIDENCE, p.page),
      description: null,
      basePrice: {
        originalText: p.originalText,
        amount: p.amount,
        currency,
        type: "BASE",
        confidence: PRICE_CONFIDENCE,
        source: { page: p.page, method: "ocr", originalText: p.originalText },
      },
      image: null,
      variants: p.variants,
      addOns: [],
      ingredients: [],
      allergens: [],
      dietaryLabels: [],
      available: true,
      displayOrder: order,
      source: { page: p.page, method: "ocr" },
      confidence: NAME_CONFIDENCE,
      reviewState: "pending",
      selectedForImport: true,
      warnings: itemWarnings,
    };
  };

  const categoryCandidates: CategoryCandidate[] = categories
    .filter((c) => c.products.length > 0)
    .map((c) => {
      displayCat += 1;
      count(CATEGORY_CONFIDENCE);
      return {
        candidateId: `cat_${slugify(c.name) || displayCat}`,
        proposedId: `cat-${slugify(c.name) || `category-${displayCat}`}`,
        name: field(c.name, CATEGORY_CONFIDENCE, c.page),
        description: null,
        image: null,
        displayOrder: displayCat,
        sourcePages: [c.page],
        confidence: CATEGORY_CONFIDENCE,
        reviewState: "pending",
        selectedForImport: true,
        items: c.products.map((p, i) => buildProduct(p, i + 1)),
      };
    });

  // Products found before any heading → an "Uncategorized" bucket so nothing is lost.
  if (uncategorized.length > 0) {
    displayCat += 1;
    count(CATEGORY_CONFIDENCE);
    categoryCandidates.unshift({
      candidateId: "cat_uncategorized",
      proposedId: "cat-uncategorized",
      name: field("Uncategorized", CATEGORY_CONFIDENCE, 1),
      description: null,
      image: null,
      displayOrder: 0,
      sourcePages: [1],
      confidence: CATEGORY_CONFIDENCE,
      reviewState: "pending",
      selectedForImport: true,
      items: uncategorized.map((p, i) => buildProduct(p, i + 1)),
    });
  }

  const productCount = categoryCandidates.reduce((n, c) => n + c.items.length, 0);

  // Global honesty warning: OCR drafts always need a full review pass.
  warnings.unshift({
    id: "w_ocr_quality",
    entityType: "page",
    entityCandidateId: null,
    field: null,
    severity: "REVIEW",
    code: "OCR_LOW_CONFIDENCE",
    message:
      "This menu was read with on-device OCR (Tesseract). Item names in particular may be garbled — review every name and price before importing.",
    resolved: false,
  });

  if (productCount === 0) {
    warnings.push({
      id: "w_no_products",
      entityType: "page",
      entityCandidateId: null,
      field: null,
      severity: "BLOCKING",
      code: "PAGE_EXTRACTION_FAILED",
      message:
        "No priced items could be read from this PDF. It may be a low-resolution scan, handwritten, or in an unsupported language.",
      resolved: false,
    });
  }

  const totalFields = Math.max(1, high + med + low);

  return {
    schemaVersion: SCHEMA_VERSION,
    importId,
    restaurantId,
    source: {
      fileName,
      pageCount,
      pdfType,
      detectedLanguages: [input.defaultLanguage],
      detectedCurrencies: [currency],
      processedAt: new Date().toISOString(),
    },
    restaurant: {
      name: null,
      currency,
      defaultLanguage: input.defaultLanguage,
    },
    categories: categoryCandidates,
    unassignedCandidates: [],
    warnings,
    statistics: {
      categoryCount: categoryCandidates.length,
      productCount,
      imageCount: 0,
      pagesProcessed: pageCount,
      pagesRequiringOcr: pageCount,
      productsWithoutCategory: 0,
      productsWithoutPrice: 0,
      unassignedImages: 0,
      highConfidenceFields: high,
      mediumConfidenceFields: med,
      lowConfidenceFields: low,
      blockingWarnings: warnings.filter((w) => w.severity === "BLOCKING").length,
      reviewWarnings: warnings.filter((w) => w.severity === "REVIEW").length,
      manualCorrections: 0,
      aiAssistedPages: 0,
      failedPages: 0,
      estimatedCompleteness: Math.round((med / totalFields) * 100) / 100,
    },
  };
}
