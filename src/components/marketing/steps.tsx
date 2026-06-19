import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

export interface Step {
  icon: string;
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  className?: string;
}

/** Numbered process steps shown as a connected horizontal flow. */
export function Steps({ steps, className }: StepsProps) {
  return (
    <ol className={cn("grid gap-6 md:grid-cols-3", className)}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex h-full flex-col gap-3 rounded-[16px] border border-border bg-canvas p-6 shadow-card"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-[12px] bg-surface-warm text-primary">
              <Icon name={step.icon} className="size-6" aria-hidden />
            </span>
            <span
              className="font-display text-h2 text-text-tertiary"
              aria-hidden
            >
              {index + 1}
            </span>
          </div>
          <h3 className="font-heading text-h3 font-bold text-text-primary">{step.title}</h3>
          <p className="text-small text-text-secondary">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
