import type { MenuCategory, MenuProduct } from "@/domain/entities";
import {
  SCHEMA_VERSION,
  type CategoryCandidate,
  type ImportConfig,
  type ImportResult,
  type ImportWarning,
  type ProductCandidate,
  type StringField,
} from "@/domain/menu-import";
import { resolveText } from "@/lib/i18n/locales";
import { slugify } from "@/lib/utils";

/**
 * Deterministic demo extractor.
 *
 * Builds a believable, REVIEW-WORTHY extraction draft from a restaurant's real
 * menu so the full review → approve → import workflow is demonstrable. It is NOT
 * real OCR/vision — it is clearly synthetic (every field's provenance method is
 * "demo-synthetic"). Confidence is derived deterministically from content (never
 * random) and a few fields are intentionally lowered + flagged so reviewers have
 * real work to do.
 */

export interface DeterministicExtractorInput {
  importId: string;
  restaurantId: string;
  fileName: string;
  config: ImportConfig;
  restaurantName: string;
  categories: MenuCategory[];
  products: MenuProduct[];
}

/** Stable 0..1 hash of a string (FNV-1a based) — deterministic, content-derived. */
function hashUnit(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Map a unit hash into a confidence band [min,max]. */
function conf(seed: string, min: number, max: number): number {
  return Math.round((min + hashUnit(seed) * (max - min)) * 100) / 100;
}

function field(value: string, confidence: number, page: number): StringField {
  return {
    value,
    confidence,
    source: { page, method: "demo-synthetic", originalText: value },
    manuallyCorrected: false,
  };
}

const CURRENCY_SYMBOL: Record<string, string> = { TRY: "₺", EUR: "€", USD: "$", GBP: "£" };

export function buildDeterministicResult(input: DeterministicExtractorInput): ImportResult {
  const { importId, restaurantId, fileName, config, restaurantName, categories, products } = input;
  const resolvedCurrency = config.currency !== "auto" ? config.currency : products[0]?.currency ?? "TRY";
  const defaultLanguage = config.defaultLanguage !== "auto" ? config.defaultLanguage : "en";

  const warnings: ImportWarning[] = [];
  let page = 1;
  let lowConf = 0;
  let medConf = 0;
  let highConf = 0;

  const countConf = (c: number) => {
    if (c >= 0.9) highConf++;
    else if (c >= 0.7) medConf++;
    else lowConf++;
  };

  const categoryCandidates: CategoryCandidate[] = categories.map((cat, ci) => {
    if (ci > 0 && ci % 2 === 0) page += 1; // spread categories across pages
    const catName = resolveText(cat.localizedName, "en") || `Category ${ci + 1}`;
    const catConf = conf(`cat-${cat.id}`, 0.92, 0.99);
    countConf(catConf);

    const catProducts = products.filter((p) => p.categoryId === cat.id);
    const items: ProductCandidate[] = catProducts.map((p, pi) => {
      const name = resolveText(p.localizedName, "en") || `Item ${pi + 1}`;
      const desc = resolveText(p.localizedDescription, "en");
      const nameConf = conf(`name-${p.id}`, 0.85, 0.99);
      // Intentionally lower one description per category to create review work.
      const descConf = pi === 1 ? conf(`desc-${p.id}`, 0.5, 0.68) : conf(`desc-${p.id}`, 0.8, 0.95);
      const priceConf = conf(`price-${p.id}`, 0.8, 0.99);
      countConf(nameConf);
      if (desc) countConf(descConf);
      countConf(priceConf);

      const symbol = CURRENCY_SYMBOL[p.currency] ?? "";
      const itemWarnings: string[] = [];

      if (descConf < 0.7 && desc) {
        warnings.push({
          id: `w_desc_${p.id}`,
          entityType: "product",
          entityCandidateId: p.id,
          field: "description",
          severity: "REVIEW",
          code: "DESCRIPTION_ASSOCIATION_UNCLEAR",
          message: "The description may belong to a neighbouring item — please confirm.",
          resolved: false,
        });
        itemWarnings.push("DESCRIPTION_ASSOCIATION_UNCLEAR");
      }

      // First featured item in the first category: ambiguous price (BLOCKING-ish REVIEW).
      const ambiguousPrice = ci === 0 && pi === 0;
      if (ambiguousPrice) {
        warnings.push({
          id: `w_price_${p.id}`,
          entityType: "price",
          entityCandidateId: p.id,
          field: "basePrice",
          severity: "REVIEW",
          code: "PRICE_AMBIGUOUS",
          message: `Two price-like values were found near "${name}". Confirm the base price.`,
          suggestedCorrection: `${p.price} ${p.currency}`,
          resolved: false,
        });
        itemWarnings.push("PRICE_AMBIGUOUS");
      }

      const hasImage = Boolean(p.image) || pi % 3 === 0;
      const imageConf = conf(`img-${p.id}`, 0.55, 0.92);
      if (hasImage && imageConf < 0.7) {
        warnings.push({
          id: `w_img_${p.id}`,
          entityType: "image",
          entityCandidateId: p.id,
          field: "image",
          severity: "REVIEW",
          code: "IMAGE_MATCH_LOW_CONFIDENCE",
          message: "This image was matched by proximity only — confirm it belongs to this product.",
          resolved: false,
        });
      }

      const variants = p.variants.map((v) => ({
        name: v.label,
        price: { amount: p.price + v.priceModifier, currency: p.currency },
        confidence: conf(`var-${p.id}-${v.id}`, 0.7, 0.95),
      }));

      const overall = Math.min(nameConf, priceConf, desc ? descConf : 1);

      return {
        candidateId: `item_${p.id}`,
        proposedId: `item-${slugify(name)}`,
        name: field(name, nameConf, page),
        description: desc ? field(desc, descConf, page) : null,
        basePrice: {
          originalText: `${p.price}${symbol ? ` ${symbol}` : ""}`,
          amount: p.price,
          currency: p.currency,
          type: "BASE",
          confidence: priceConf,
          source: { page, method: "demo-synthetic", originalText: `${p.price} ${symbol}` },
        },
        image: hasImage
          ? {
              assetCandidateId: `img_${p.id}`,
              temporaryUrl: p.image ?? "/placeholders/food.svg",
              confidence: imageConf,
              requiresReview: imageConf < 0.9,
              matchingSignals: ["same-card-region", "nearest-product-heading"],
            }
          : null,
        variants,
        addOns: [],
        ingredients: [],
        allergens: p.allergenNote ? ["Gluten"] : [],
        dietaryLabels: p.dietaryLabels,
        available: p.availability !== "out-of-stock",
        displayOrder: pi + 1,
        source: { page, method: "demo-synthetic" },
        confidence: Math.round(overall * 100) / 100,
        reviewState: "pending",
        selectedForImport: true,
        warnings: itemWarnings,
      };
    });

    return {
      candidateId: `cat_${cat.id}`,
      proposedId: `cat-${slugify(catName)}`,
      name: field(catName, catConf, page),
      description: null,
      image: null,
      displayOrder: ci + 1,
      sourcePages: [page],
      confidence: catConf,
      reviewState: "pending",
      selectedForImport: true,
      items,
    };
  });

  // One unassigned candidate to demonstrate the "Unassigned Content" workflow.
  const unassignedCandidates: ProductCandidate[] = [];
  if (products.length > 0) {
    const sample = products[products.length - 1];
    const orphanName = `${resolveText(sample.localizedName, "en")} (footnote)`;
    const orphanConf = conf(`orphan-${sample.id}`, 0.4, 0.62);
    countConf(orphanConf);
    warnings.push({
      id: `w_unassigned_${sample.id}`,
      entityType: "product",
      entityCandidateId: `orphan_${sample.id}`,
      field: null,
      severity: "REVIEW",
      code: "UNASSIGNED_TEXT",
      message: "Text near a page footer could not be confidently assigned to a category.",
      resolved: false,
    });
    unassignedCandidates.push({
      candidateId: `orphan_${sample.id}`,
      proposedId: `item-${slugify(orphanName)}`,
      name: field(orphanName, orphanConf, page),
      description: null,
      basePrice: null,
      image: null,
      variants: [],
      addOns: [],
      ingredients: [],
      allergens: [],
      dietaryLabels: [],
      available: true,
      displayOrder: 999,
      source: { page, method: "demo-synthetic" },
      confidence: orphanConf,
      reviewState: "pending",
      selectedForImport: false,
      warnings: ["UNASSIGNED_TEXT"],
    });
  }

  const productCount = categoryCandidates.reduce((n, c) => n + c.items.length, 0);
  const imageCount = categoryCandidates.reduce(
    (n, c) => n + c.items.filter((i) => i.image).length,
    0,
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    importId,
    restaurantId,
    source: {
      fileName,
      pageCount: page,
      pdfType: "mixed",
      detectedLanguages: [defaultLanguage],
      detectedCurrencies: [resolvedCurrency],
      processedAt: new Date().toISOString(),
    },
    restaurant: {
      name: field(restaurantName, conf(`rest-${restaurantId}`, 0.9, 0.98), 1),
      currency: resolvedCurrency,
      defaultLanguage,
    },
    categories: categoryCandidates,
    unassignedCandidates,
    warnings,
    statistics: {
      categoryCount: categoryCandidates.length,
      productCount,
      imageCount,
      pagesProcessed: page,
      pagesRequiringOcr: config.extractionMode === "ocr-only" ? page : Math.max(0, Math.floor(page / 3)),
      productsWithoutCategory: unassignedCandidates.length,
      productsWithoutPrice: unassignedCandidates.filter((u) => !u.basePrice).length,
      unassignedImages: 0,
      highConfidenceFields: highConf,
      mediumConfidenceFields: medConf,
      lowConfidenceFields: lowConf,
      blockingWarnings: warnings.filter((w) => w.severity === "BLOCKING").length,
      reviewWarnings: warnings.filter((w) => w.severity === "REVIEW").length,
      manualCorrections: 0,
      aiAssistedPages: 0,
      failedPages: 0,
      estimatedCompleteness:
        productCount > 0
          ? Math.round((1 - lowConf / Math.max(1, highConf + medConf + lowConf)) * 100) / 100
          : 0,
    },
  };
}
