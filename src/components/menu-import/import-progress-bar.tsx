import { cn } from "@/lib/utils";

interface ImportProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

/** Accessible determinate progress bar (role=progressbar + aria-valuenow). */
export function ImportProgressBar({ value, label = "Extraction progress", className }: ImportProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-muted", className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
