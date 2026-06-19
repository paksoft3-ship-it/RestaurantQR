import { z } from "zod";
import {
  EXTRACTION_METHODS,
  EXTRACTION_MODES,
  EXISTING_MENU_BEHAVIORS,
  IMAGE_HANDLING_MODES,
  IMPORT_CURRENCY_OPTIONS,
  IMPORT_LANGUAGE_OPTIONS,
  IMPORT_WARNING_CODES,
  PDF_TYPES,
  PRICE_TYPES,
  WARNING_SEVERITIES,
  CANDIDATE_REVIEW_STATES,
} from "./enums";

/**
 * Canonical, versioned PDF-menu-import schema (v1.0.0).
 *
 * This is the contract between the extraction worker and the Next.js app. The
 * Python worker mirrors it with Pydantic (services/menu-extraction-worker) and
 * the two are kept aligned via the JSON example in docs + shared schema tests.
 *
 * Money follows the project's existing representation: a decimal `amount` number
 * plus an ISO `currency` code (matches MenuProduct.price / currency).
 */

export const SCHEMA_VERSION = "1.0.0";

export const boundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
export type BoundingBox = z.infer<typeof boundingBoxSchema>;

export const provenanceSchema = z.object({
  page: z.number().int().min(0),
  boundingBox: boundingBoxSchema.nullable().optional(),
  method: z.enum(EXTRACTION_METHODS),
  originalText: z.string().nullable().optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

/** A single extracted value carrying confidence + provenance. */
export function valuedField<T extends z.ZodTypeAny>(inner: T) {
  return z.object({
    value: inner,
    confidence: z.number().min(0).max(1),
    source: provenanceSchema.nullable().optional(),
    manuallyCorrected: z.boolean().optional().default(false),
  });
}

export const stringFieldSchema = valuedField(z.string());
export type StringField = z.infer<typeof stringFieldSchema>;

export const priceSchema = z.object({
  originalText: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string().min(2).max(4),
  type: z.enum(PRICE_TYPES).default("BASE"),
  confidence: z.number().min(0).max(1),
  source: provenanceSchema.nullable().optional(),
});
export type ImportPrice = z.infer<typeof priceSchema>;

export const variantSchema = z.object({
  name: z.string(),
  price: z.object({ amount: z.number().nonnegative(), currency: z.string() }),
  confidence: z.number().min(0).max(1).optional(),
});
export type ImportVariant = z.infer<typeof variantSchema>;

export const addOnSchema = z.object({
  name: z.string(),
  price: z.object({ amount: z.number().nonnegative(), currency: z.string() }).nullable().optional(),
  confidence: z.number().min(0).max(1).optional(),
});
export type ImportAddOn = z.infer<typeof addOnSchema>;

export const imageRefSchema = z.object({
  assetCandidateId: z.string(),
  temporaryUrl: z.string(),
  confidence: z.number().min(0).max(1),
  requiresReview: z.boolean().default(true),
  matchingSignals: z.array(z.string()).optional().default([]),
});
export type ImportImageRef = z.infer<typeof imageRefSchema>;

export const importWarningSchema = z.object({
  id: z.string(),
  entityType: z.enum(["restaurant", "category", "product", "price", "image", "page"]),
  entityCandidateId: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  severity: z.enum(WARNING_SEVERITIES),
  code: z.enum(IMPORT_WARNING_CODES),
  message: z.string(),
  suggestedCorrection: z.string().nullable().optional(),
  resolved: z.boolean().default(false),
  resolvedBy: z.string().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
});
export type ImportWarning = z.infer<typeof importWarningSchema>;

export const productCandidateSchema = z.object({
  candidateId: z.string(),
  proposedId: z.string(),
  name: stringFieldSchema,
  description: stringFieldSchema.nullable().optional(),
  basePrice: priceSchema.nullable().optional(),
  image: imageRefSchema.nullable().optional(),
  variants: z.array(variantSchema).default([]),
  addOns: z.array(addOnSchema).default([]),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  dietaryLabels: z.array(z.string()).default([]),
  available: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  source: provenanceSchema.nullable().optional(),
  confidence: z.number().min(0).max(1),
  reviewState: z.enum(CANDIDATE_REVIEW_STATES).default("pending"),
  selectedForImport: z.boolean().default(true),
  warnings: z.array(z.string()).default([]),
});
export type ProductCandidate = z.infer<typeof productCandidateSchema>;

export const categoryCandidateSchema = z.object({
  candidateId: z.string(),
  proposedId: z.string(),
  name: stringFieldSchema,
  description: stringFieldSchema.nullable().optional(),
  image: imageRefSchema.nullable().optional(),
  displayOrder: z.number().int().default(0),
  sourcePages: z.array(z.number().int()).default([]),
  confidence: z.number().min(0).max(1),
  reviewState: z.enum(CANDIDATE_REVIEW_STATES).default("pending"),
  selectedForImport: z.boolean().default(true),
  items: z.array(productCandidateSchema).default([]),
});
export type CategoryCandidate = z.infer<typeof categoryCandidateSchema>;

export const importStatisticsSchema = z.object({
  categoryCount: z.number().int().default(0),
  productCount: z.number().int().default(0),
  imageCount: z.number().int().default(0),
  pagesProcessed: z.number().int().default(0),
  pagesRequiringOcr: z.number().int().default(0),
  productsWithoutCategory: z.number().int().default(0),
  productsWithoutPrice: z.number().int().default(0),
  unassignedImages: z.number().int().default(0),
  highConfidenceFields: z.number().int().default(0),
  mediumConfidenceFields: z.number().int().default(0),
  lowConfidenceFields: z.number().int().default(0),
  blockingWarnings: z.number().int().default(0),
  reviewWarnings: z.number().int().default(0),
  manualCorrections: z.number().int().default(0),
  aiAssistedPages: z.number().int().default(0),
  failedPages: z.number().int().default(0),
  estimatedCompleteness: z.number().min(0).max(1).default(0),
});
export type ImportStatistics = z.infer<typeof importStatisticsSchema>;

export const importSourceSchema = z.object({
  fileName: z.string(),
  pageCount: z.number().int().min(0),
  pdfType: z.enum(PDF_TYPES),
  detectedLanguages: z.array(z.string()).default([]),
  detectedCurrencies: z.array(z.string()).default([]),
  processedAt: z.string(),
});
export type ImportSource = z.infer<typeof importSourceSchema>;

/** The full canonical extraction result. */
export const importResultSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  importId: z.string(),
  restaurantId: z.string(),
  source: importSourceSchema,
  restaurant: z.object({
    name: stringFieldSchema.nullable().optional(),
    currency: z.string(),
    defaultLanguage: z.string(),
  }),
  categories: z.array(categoryCandidateSchema).default([]),
  unassignedCandidates: z.array(productCandidateSchema).default([]),
  warnings: z.array(importWarningSchema).default([]),
  statistics: importStatisticsSchema,
});
export type ImportResult = z.infer<typeof importResultSchema>;

/** Upload/import configuration (the admin form). */
export const importConfigSchema = z.object({
  defaultLanguage: z.enum(IMPORT_LANGUAGE_OPTIONS).default("auto"),
  currency: z.enum(IMPORT_CURRENCY_OPTIONS).default("auto"),
  existingMenuBehavior: z.enum(EXISTING_MENU_BEHAVIORS).default("new-draft"),
  imageHandling: z.enum(IMAGE_HANDLING_MODES).default("manual-review"),
  extractionMode: z.enum(EXTRACTION_MODES).default("maximum-accuracy"),
});
export type ImportConfig = z.infer<typeof importConfigSchema>;
