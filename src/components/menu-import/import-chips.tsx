import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import {
  confidenceLevel,
  PROCESSING_STATUS_META,
  REVIEW_STATUS_META,
  SEVERITY_META,
  type ImportProcessingStatus,
  type ImportReviewStatus,
  type WarningSeverity,
} from "@/domain/menu-import";

/** Processing-status badge (icon + text — never colour only). */
export function ProcessingStatusBadge({ status }: { status: ImportProcessingStatus }) {
  const meta = PROCESSING_STATUS_META[status];
  return (
    <Badge intent={meta.intent}>
      <Icon name={meta.icon} className="size-3" aria-hidden />
      {meta.label}
    </Badge>
  );
}

/** Review-status badge (icon + text). */
export function ReviewStatusBadge({ status }: { status: ImportReviewStatus }) {
  const meta = REVIEW_STATUS_META[status];
  return (
    <Badge intent={meta.intent}>
      <Icon name={meta.icon} className="size-3" aria-hidden />
      {meta.label}
    </Badge>
  );
}

/** Severity badge for warnings. */
export function SeverityBadge({ severity }: { severity: WarningSeverity }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge intent={meta.intent}>
      <Icon name={meta.icon} className="size-3" aria-hidden />
      {meta.label}
    </Badge>
  );
}

const CONFIDENCE_META: Record<
  ReturnType<typeof confidenceLevel>,
  { label: string; intent: "success" | "warning" | "danger"; icon: string }
> = {
  HIGH: { label: "High Confidence", intent: "success", icon: "ShieldCheck" },
  MEDIUM: { label: "Medium Confidence", intent: "warning", icon: "ShieldAlert" },
  LOW: { label: "Low Confidence", intent: "danger", icon: "ShieldX" },
};

/**
 * Confidence chip — text + colour (not colour alone), formatted as
 * "High/Medium/Low Confidence · NN%".
 */
export function ConfidenceChip({ value }: { value: number }) {
  const level = confidenceLevel(value);
  const meta = CONFIDENCE_META[level];
  const pct = Math.round(value * 100);
  return (
    <Badge intent={meta.intent} aria-label={`${meta.label}, ${pct} percent`}>
      <Icon name={meta.icon} className="size-3" aria-hidden />
      {meta.label} · {pct}%
    </Badge>
  );
}
