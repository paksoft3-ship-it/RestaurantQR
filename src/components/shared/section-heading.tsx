import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Heading level — use "h1" for the page's primary heading. */
  as?: "h1" | "h2";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="font-body text-small font-bold uppercase tracking-wide text-primary">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="font-display text-h1 text-text-primary">{title}</Heading>
      {description ? <p className="text-body text-text-secondary">{description}</p> : null}
    </div>
  );
}
