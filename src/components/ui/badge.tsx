import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { StatusIntent } from "@/domain/status";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-body text-xs font-semibold",
  {
    variants: {
      intent: {
        neutral: "border-border bg-surface-container text-text-secondary",
        info: "border-info/20 bg-info/10 text-info",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-danger/20 bg-danger/10 text-danger",
        primary: "border-primary/20 bg-surface-warm text-primary",
      } satisfies Record<StatusIntent, string>,
    },
    defaultVariants: { intent: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, intent, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ intent }), className)} {...props} />;
}

export { badgeVariants };
