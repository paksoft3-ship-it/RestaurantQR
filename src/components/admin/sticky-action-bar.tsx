import { cn } from "@/lib/utils";

interface StickyActionBarProps {
  /** Left-aligned status / summary content. */
  info?: React.ReactNode;
  /** Right-aligned action buttons. */
  children: React.ReactNode;
  className?: string;
}

/** Sticky bottom bar for form save/cancel actions. */
export function StickyActionBar({ info, children, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-2 flex flex-col gap-3 border-t border-border bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="min-w-0 text-small text-text-secondary">{info}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>
    </div>
  );
}
