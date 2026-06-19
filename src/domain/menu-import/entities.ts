import type { ImportConfig, ImportResult } from "./schema";
import type {
  ImportErrorCode,
  ImportPipelineStage,
  ImportProcessingStatus,
  ImportReviewStatus,
} from "./enums";

/** A progress/audit event emitted by the (demo) extraction pipeline. */
export interface MenuImportEvent {
  id: string;
  stage: ImportPipelineStage | "QUEUED" | "DONE";
  status: ImportProcessingStatus;
  progress: number;
  message: string;
  page?: number | null;
  totalPages?: number | null;
  warningCount?: number;
  createdAt: string;
}

/**
 * The persisted import record (DB-equivalent). In this demo it is stored in the
 * browser demo store with the canonical `result` embedded; in production this
 * maps to MenuImport + child candidate/warning/event tables.
 */
export interface MenuImport {
  id: string;
  restaurantId: string;
  originalFileName: string;
  fileHash: string | null;
  fileSize: number;
  pageCount: number;
  pdfType: string;
  config: ImportConfig;
  schemaVersion: string;
  processingStatus: ImportProcessingStatus;
  reviewStatus: ImportReviewStatus;
  progress: number;
  currentStage: string | null;
  errorCode: ImportErrorCode | null;
  errorSummary: string | null;
  /** The canonical extraction result, mutated during review. Null until extracted. */
  result: ImportResult | null;
  events: MenuImportEvent[];
  /** Idempotency key to dedupe repeated start requests. */
  idempotencyKey: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  approvedBy: string | null;
  committedMenuRef: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  archivedAt: string | null;
}
