import { cn } from "@/lib/utils";

interface PreviewColors {
  primary?: string;
  primaryDark?: string;
  accent?: string;
  surface?: string;
  text?: string;
}

interface PreviewPanelProps {
  /** Optional draft colors that tint the preview frame live. */
  colors?: PreviewColors;
  headingFont?: string;
  bodyFont?: string;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Phone-frame wrapper for live previews. Accepts children plus optional draft
 * colors/typography so branding and workspace previews update in real time.
 */
export function PreviewPanel({
  colors,
  headingFont,
  bodyFont,
  label = "Mobile preview",
  children,
  className,
}: PreviewPanelProps) {
  const style: React.CSSProperties & Record<string, string> = {};
  if (colors?.primary) style["--preview-primary"] = colors.primary;
  if (colors?.primaryDark) style["--preview-primary-dark"] = colors.primaryDark;
  if (colors?.accent) style["--preview-accent"] = colors.accent;
  if (colors?.surface) style["--preview-surface"] = colors.surface;
  if (colors?.text) style["--preview-text"] = colors.text;
  if (headingFont) style["--preview-heading-font"] = headingFont;
  if (bodyFont) style["--preview-body-font"] = bodyFont;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className="relative mx-auto w-full max-w-[280px] rounded-[36px] border-[6px] border-navy bg-navy p-2 shadow-lift"
        role="img"
        aria-label={label}
      >
        <div
          className="overflow-hidden rounded-[28px] bg-canvas"
          style={style}
        >
          <div className="flex h-6 items-center justify-center bg-navy">
            <span className="h-1.5 w-16 rounded-full bg-white/30" aria-hidden />
          </div>
          <div className="min-h-[420px]">{children}</div>
        </div>
      </div>
      <p className="text-xs text-text-tertiary">{label} · illustrative</p>
    </div>
  );
}
