import type { ImportConfig, ImportResult } from "@/domain/menu-import";
import type { MenuImportEvent } from "@/domain/menu-import";

/**
 * Extraction worker abstraction. The demo uses an in-app deterministic extractor;
 * production swaps this for a client that calls the containerized Python worker
 * (or enqueues a job) implementing the same contract.
 */
export interface ExtractionContext {
  importId: string;
  restaurantId: string;
  fileName: string;
  config: ImportConfig;
  /** Emit a pipeline progress/audit event. */
  onEvent: (event: MenuImportEvent) => void;
  /** Resolves true if the job has been asked to cancel. */
  isCancelled: () => boolean;
}

export interface MenuExtractionWorker {
  /** Run the full pipeline, emitting staged events, returning the canonical result. */
  extract(ctx: ExtractionContext): Promise<ImportResult>;
}

/* ---- Optional AI-assisted analysis (provider-agnostic; testable, no live calls) ---- */

export interface PageAnalysisInput {
  importId: string;
  page: number;
  text: string;
  imageRefs: string[];
}
export interface PageAnalysisResult {
  blocks: { type: string; text: string; confidence: number }[];
  confidence: number;
}

export interface MenuNormalizationInput {
  draft: ImportResult;
}
export interface MenuNormalizationResult {
  normalized: ImportResult;
  confidence: number;
}

export interface AssociationValidationInput {
  pairs: { imageId: string; productCandidateId: string }[];
}
export interface AssociationValidationResult {
  validated: { imageId: string; productCandidateId: string; confidence: number }[];
}

export interface MenuExtractionAIProvider {
  analyzePage(input: PageAnalysisInput): Promise<PageAnalysisResult>;
  normalizeMenu(input: MenuNormalizationInput): Promise<MenuNormalizationResult>;
  validateAssociations(
    input: AssociationValidationInput,
  ): Promise<AssociationValidationResult>;
}

/** No-op deterministic provider used when AI is disabled (and in tests). */
export const noopAIProvider: MenuExtractionAIProvider = {
  async analyzePage() {
    return { blocks: [], confidence: 0 };
  },
  async normalizeMenu({ draft }) {
    return { normalized: draft, confidence: 0 };
  },
  async validateAssociations({ pairs }) {
    return { validated: pairs.map((p) => ({ ...p, confidence: 0 })) };
  },
};
