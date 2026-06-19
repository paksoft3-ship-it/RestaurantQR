import { Icon } from "@/components/shared/icon";
import { formatDate } from "@/lib/utils";
import { ROLE_LABELS } from "@/domain/permissions";
import type { ActivityRecord } from "@/domain/entities";

interface ActivityFeedProps {
  items: ActivityRecord[];
  emptyLabel?: string;
}

function iconForAction(action: string): string {
  if (action.includes("publish")) return "Globe";
  if (action.includes("approve")) return "CheckCircle2";
  if (action.includes("create")) return "Plus";
  if (action.includes("update") || action.includes("edit")) return "FileEdit";
  if (action.includes("disable") || action.includes("archive")) return "Archive";
  return "Activity";
}

/** Vertical timeline of recent admin activity. */
export function ActivityFeed({ items, emptyLabel = "No recent activity." }: ActivityFeedProps) {
  if (items.length === 0) {
    return <p className="text-small text-text-secondary">{emptyLabel}</p>;
  }

  return (
    <ol className="flex flex-col gap-1">
      {items.map((item, i) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-warm text-primary">
              <Icon name={iconForAction(item.action)} className="size-4" aria-hidden />
            </span>
            {i < items.length - 1 ? <span className="w-px flex-1 bg-border" aria-hidden /> : null}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-small text-text-primary">{item.description}</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {ROLE_LABELS[item.actorRole]} · {formatDate(item.timestamp)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
