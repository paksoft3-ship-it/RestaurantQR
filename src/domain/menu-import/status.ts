import type { StatusIntent } from "@/domain/status";
import type {
  ImportProcessingStatus,
  ImportReviewStatus,
  WarningSeverity,
} from "./enums";

interface Meta {
  label: string;
  intent: StatusIntent;
  icon: string;
}

export const PROCESSING_STATUS_META: Record<ImportProcessingStatus, Meta> = {
  UPLOADED: { label: "Uploaded", intent: "neutral", icon: "Upload" },
  VALIDATING: { label: "Validating", intent: "info", icon: "ShieldCheck" },
  QUEUED: { label: "Queued", intent: "info", icon: "Clock" },
  PREFLIGHT: { label: "Preflight", intent: "info", icon: "ScanSearch" },
  EXTRACTING_TEXT: { label: "Extracting text", intent: "primary", icon: "FileText" },
  RUNNING_OCR: { label: "Running OCR", intent: "primary", icon: "ScanText" },
  ANALYZING_LAYOUT: { label: "Analyzing layout", intent: "primary", icon: "LayoutPanelTop" },
  EXTRACTING_IMAGES: { label: "Extracting images", intent: "primary", icon: "Image" },
  MATCHING_IMAGES: { label: "Matching images", intent: "primary", icon: "Link" },
  STRUCTURING_DATA: { label: "Structuring data", intent: "primary", icon: "ListTree" },
  VALIDATING_OUTPUT: { label: "Validating output", intent: "info", icon: "CheckCheck" },
  REVIEW_REQUIRED: { label: "Review required", intent: "warning", icon: "Eye" },
  READY_TO_IMPORT: { label: "Ready to import", intent: "success", icon: "CircleCheck" },
  IMPORTING: { label: "Importing", intent: "primary", icon: "DatabaseZap" },
  COMPLETED: { label: "Completed", intent: "success", icon: "CircleCheckBig" },
  PARTIALLY_COMPLETED: { label: "Partially completed", intent: "warning", icon: "TriangleAlert" },
  FAILED: { label: "Failed", intent: "danger", icon: "CircleX" },
  CANCELLED: { label: "Cancelled", intent: "neutral", icon: "Ban" },
  ARCHIVED: { label: "Archived", intent: "neutral", icon: "Archive" },
};

export const REVIEW_STATUS_META: Record<ImportReviewStatus, Meta> = {
  NOT_STARTED: { label: "Not started", intent: "neutral", icon: "Circle" },
  IN_REVIEW: { label: "In review", intent: "warning", icon: "Eye" },
  CHANGES_REQUIRED: { label: "Changes required", intent: "danger", icon: "TriangleAlert" },
  APPROVED: { label: "Approved", intent: "success", icon: "CircleCheck" },
  REJECTED: { label: "Rejected", intent: "danger", icon: "CircleX" },
};

export const SEVERITY_META: Record<WarningSeverity, Meta> = {
  INFO: { label: "Info", intent: "info", icon: "Info" },
  REVIEW: { label: "Review", intent: "warning", icon: "TriangleAlert" },
  BLOCKING: { label: "Blocking", intent: "danger", icon: "OctagonAlert" },
};

export const TERMINAL_STATUSES: ImportProcessingStatus[] = [
  "COMPLETED",
  "PARTIALLY_COMPLETED",
  "FAILED",
  "CANCELLED",
  "ARCHIVED",
];
