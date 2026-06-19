import {
  importResultSchema,
  type ImportResult,
  type ImportWarning,
} from "@/domain/menu-import";

export interface ValidationOutcome {
  ok: boolean;
  schemaErrors: string[];
  blockingWarnings: ImportWarning[];
  unresolvedBlocking: ImportWarning[];
  selectedCategories: number;
  selectedProducts: number;
}

/** Validate a reviewed result against the schema + blocking-warning rules. */
export function validateImportResult(result: ImportResult): ValidationOutcome {
  const parsed = importResultSchema.safeParse(result);
  const schemaErrors = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);

  const blockingWarnings = result.warnings.filter((w) => w.severity === "BLOCKING");
  const unresolvedBlocking = blockingWarnings.filter((w) => !w.resolved);

  const selectedCategories = result.categories.filter(
    (c) => c.selectedForImport && c.reviewState !== "rejected",
  );
  const selectedProducts = selectedCategories.reduce(
    (n, c) =>
      n + c.items.filter((i) => i.selectedForImport && i.reviewState !== "rejected").length,
    0,
  );

  return {
    ok: parsed.success && unresolvedBlocking.length === 0 && selectedProducts > 0,
    schemaErrors,
    blockingWarnings,
    unresolvedBlocking,
    selectedCategories: selectedCategories.length,
    selectedProducts,
  };
}

export interface QualityReport {
  pagesProcessed: number;
  pagesRequiringOcr: number;
  categoriesDetected: number;
  productsDetected: number;
  productsWithoutCategory: number;
  productsWithoutPrice: number;
  imagesExtracted: number;
  unassignedImages: number;
  highConfidenceFields: number;
  mediumConfidenceFields: number;
  lowConfidenceFields: number;
  blockingWarnings: number;
  reviewWarnings: number;
  manualCorrections: number;
  aiAssistedPages: number;
  failedPages: number;
  /** Estimated completeness (0..1) — NOT a guarantee of accuracy. */
  estimatedCompleteness: number;
}

export function buildQualityReport(result: ImportResult): QualityReport {
  const s = result.statistics;
  return {
    pagesProcessed: s.pagesProcessed,
    pagesRequiringOcr: s.pagesRequiringOcr,
    categoriesDetected: s.categoryCount,
    productsDetected: s.productCount,
    productsWithoutCategory: s.productsWithoutCategory,
    productsWithoutPrice: s.productsWithoutPrice,
    imagesExtracted: s.imageCount,
    unassignedImages: s.unassignedImages,
    highConfidenceFields: s.highConfidenceFields,
    mediumConfidenceFields: s.mediumConfidenceFields,
    lowConfidenceFields: s.lowConfidenceFields,
    blockingWarnings: s.blockingWarnings,
    reviewWarnings: s.reviewWarnings,
    manualCorrections: s.manualCorrections,
    aiAssistedPages: s.aiAssistedPages,
    failedPages: s.failedPages,
    estimatedCompleteness: s.estimatedCompleteness,
  };
}
