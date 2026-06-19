import { cn } from "@/lib/utils";

/** Accessible loading skeleton block. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[10px] bg-surface-container", className)}
      aria-hidden
      {...props}
    />
  );
}

/** Page-level loading region with an SR announcement. */
export function LoadingRegion({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
