/**
 * Controlled vocabularies for the PDF Menu Import feature. Kept separate from the
 * canonical schema so both the Zod schema and the UI/status systems share them.
 */

/** Processing status (separate from review status). */
export const IMPORT_PROCESSING_STATUSES = [
  "UPLOADED",
  "VALIDATING",
  "QUEUED",
  "PREFLIGHT",
  "EXTRACTING_TEXT",
  "RUNNING_OCR",
  "ANALYZING_LAYOUT",
  "EXTRACTING_IMAGES",
  "MATCHING_IMAGES",
  "STRUCTURING_DATA",
  "VALIDATING_OUTPUT",
  "REVIEW_REQUIRED",
  "READY_TO_IMPORT",
  "IMPORTING",
  "COMPLETED",
  "PARTIALLY_COMPLETED",
  "FAILED",
  "CANCELLED",
  "ARCHIVED",
] as const;
export type ImportProcessingStatus = (typeof IMPORT_PROCESSING_STATUSES)[number];

/** Ordered pipeline stages that report progress (subset of processing statuses). */
export const IMPORT_PIPELINE_STAGES = [
  "VALIDATING",
  "PREFLIGHT",
  "EXTRACTING_TEXT",
  "RUNNING_OCR",
  "ANALYZING_LAYOUT",
  "EXTRACTING_IMAGES",
  "MATCHING_IMAGES",
  "STRUCTURING_DATA",
  "VALIDATING_OUTPUT",
] as const;
export type ImportPipelineStage = (typeof IMPORT_PIPELINE_STAGES)[number];

export const IMPORT_REVIEW_STATUSES = [
  "NOT_STARTED",
  "IN_REVIEW",
  "CHANGES_REQUIRED",
  "APPROVED",
  "REJECTED",
] as const;
export type ImportReviewStatus = (typeof IMPORT_REVIEW_STATUSES)[number];

export const EXTRACTION_MODES = [
  "balanced",
  "maximum-accuracy",
  "fast-draft",
  "ocr-only",
  "text-only",
  "visual-required",
] as const;
export type ExtractionMode = (typeof EXTRACTION_MODES)[number];

export const EXISTING_MENU_BEHAVIORS = [
  "new-draft",
  "add-to-draft",
  "replace-draft",
  "compare",
  "selected-categories",
] as const;
export type ExistingMenuBehavior = (typeof EXISTING_MENU_BEHAVIORS)[number];

export const IMAGE_HANDLING_MODES = [
  "extract-embedded",
  "detect-and-crop",
  "page-images-only",
  "skip-images",
  "manual-review",
] as const;
export type ImageHandlingMode = (typeof IMAGE_HANDLING_MODES)[number];

export const PDF_TYPES = ["text", "scanned", "mixed", "unknown"] as const;
export type PdfType = (typeof PDF_TYPES)[number];

export const IMPORT_LANGUAGE_OPTIONS = ["auto", "tr", "en", "ar", "de"] as const;
export type ImportLanguageOption = (typeof IMPORT_LANGUAGE_OPTIONS)[number];

export const IMPORT_CURRENCY_OPTIONS = ["auto", "TRY", "EUR", "USD", "GBP"] as const;
export type ImportCurrencyOption = (typeof IMPORT_CURRENCY_OPTIONS)[number];

export const PRICE_TYPES = ["BASE", "VARIANT", "PROMOTIONAL", "ORIGINAL"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const EXTRACTION_METHODS = [
  "native-text",
  "ocr",
  "layout",
  "vision-ai",
  "manual",
  "demo-synthetic",
] as const;
export type ExtractionMethod = (typeof EXTRACTION_METHODS)[number];

export const CANDIDATE_REVIEW_STATES = ["pending", "approved", "rejected", "edited"] as const;
export type CandidateReviewState = (typeof CANDIDATE_REVIEW_STATES)[number];

export const WARNING_SEVERITIES = ["INFO", "REVIEW", "BLOCKING"] as const;
export type WarningSeverity = (typeof WARNING_SEVERITIES)[number];

export const IMPORT_WARNING_CODES = [
  "PRICE_AMBIGUOUS",
  "PRICE_CURRENCY_MISSING",
  "PRICE_VARIANT_UNCLEAR",
  "OCR_LOW_CONFIDENCE",
  "PRODUCT_NAME_UNCLEAR",
  "DESCRIPTION_ASSOCIATION_UNCLEAR",
  "CATEGORY_ASSOCIATION_UNCLEAR",
  "IMAGE_MATCH_LOW_CONFIDENCE",
  "IMAGE_DUPLICATE",
  "IMAGE_TOO_SMALL",
  "IMAGE_DECORATIVE",
  "PRODUCT_DUPLICATE",
  "CATEGORY_DUPLICATE",
  "ALLERGEN_UNCONFIRMED",
  "DIETARY_LABEL_UNCONFIRMED",
  "LANGUAGE_UNCERTAIN",
  "READING_ORDER_UNCERTAIN",
  "PROMOTIONAL_PRICE_UNCLEAR",
  "ADDON_PARENT_UNCLEAR",
  "UNASSIGNED_TEXT",
  "UNASSIGNED_IMAGE",
  "PAGE_EXTRACTION_FAILED",
] as const;
export type ImportWarningCode = (typeof IMPORT_WARNING_CODES)[number];

export const IMPORT_ERROR_CODES = [
  "INVALID_PDF",
  "PDF_ENCRYPTED",
  "PDF_PASSWORD_REQUIRED",
  "PDF_CORRUPT",
  "PDF_TOO_LARGE",
  "PAGE_LIMIT_EXCEEDED",
  "UNSAFE_PDF",
  "TEXT_EXTRACTION_FAILED",
  "OCR_FAILED",
  "LAYOUT_ANALYSIS_FAILED",
  "IMAGE_EXTRACTION_FAILED",
  "AI_PROVIDER_FAILED",
  "SCHEMA_VALIDATION_FAILED",
  "STORAGE_FAILED",
  "JOB_TIMEOUT",
  "JOB_CANCELLED",
  "IMPORT_CONFLICT",
  "DATABASE_IMPORT_FAILED",
  "PERMISSION_DENIED",
] as const;
export type ImportErrorCode = (typeof IMPORT_ERROR_CODES)[number];

export const CONFIDENCE_THRESHOLDS = { high: 0.9, medium: 0.7 } as const;

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export function confidenceLevel(
  value: number,
  thresholds: { high: number; medium: number } = CONFIDENCE_THRESHOLDS,
): ConfidenceLevel {
  if (value >= thresholds.high) return "HIGH";
  if (value >= thresholds.medium) return "MEDIUM";
  return "LOW";
}

/** Stage → human label + nominal progress percentage (for honest progress display). */
export const STAGE_META: Record<ImportPipelineStage, { label: string; progress: number }> = {
  VALIDATING: { label: "Validating PDF", progress: 5 },
  PREFLIGHT: { label: "Inspecting pages", progress: 12 },
  EXTRACTING_TEXT: { label: "Extracting text", progress: 25 },
  RUNNING_OCR: { label: "Running OCR", progress: 40 },
  ANALYZING_LAYOUT: { label: "Analyzing menu layout", progress: 55 },
  EXTRACTING_IMAGES: { label: "Extracting image candidates", progress: 68 },
  MATCHING_IMAGES: { label: "Matching images to products", progress: 78 },
  STRUCTURING_DATA: { label: "Structuring categories and products", progress: 88 },
  VALIDATING_OUTPUT: { label: "Validating output", progress: 95 },
};
