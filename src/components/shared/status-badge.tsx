import { getStatus, type StatusGroup } from "@/domain/status";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";

interface StatusBadgeProps {
  group: StatusGroup;
  value: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Status indicator that pairs an icon + text with semantic color, so status is
 * never communicated by color alone.
 */
export function StatusBadge({ group, value, className, showIcon = true }: StatusBadgeProps) {
  const status = getStatus(group, value);
  return (
    <Badge intent={status.intent} className={className} title={status.description}>
      {showIcon ? <Icon name={status.icon} className="size-3.5" aria-hidden /> : null}
      {status.label}
    </Badge>
  );
}
