"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface RestaurantActionItemProps {
  iconSrc: string;
  label: string;
  /** Mode determines the element + behavior. */
  mode: "internal" | "tel" | "external" | "download" | "disabled";
  href?: string | null;
  active?: boolean;
  /** Screen-reader-only suffix, e.g. "Opens an external website". */
  srHint?: string;
  /** Accessible explanation for the disabled state. */
  unavailableLabel?: string;
  onActivate?: () => void;
  downloadName?: string;
}

/**
 * A single fixed-bar action: a supplied PNG badge + a short label. The PNGs
 * already contain circular artwork, so no extra circular background is added.
 */
export function RestaurantActionItem({
  iconSrc,
  label,
  mode,
  href,
  active = false,
  srHint,
  unavailableLabel,
  onActivate,
  downloadName,
}: RestaurantActionItemProps) {
  const inner = (
    <span
      className={cn(
        "flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-center",
        active ? "text-primary" : "text-text-secondary",
      )}
    >
      <Image
        src={iconSrc}
        alt=""
        width={38}
        height={38}
        className="size-9 object-contain"
        aria-hidden
      />
      <span className={cn("text-[11px] font-semibold leading-tight", active && "text-primary")}>
        {label}
      </span>
    </span>
  );

  const focusCls =
    "block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary";

  if (mode === "disabled" || !href) {
    return (
      <li className="flex-1">
        <span
          aria-disabled="true"
          className="flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-center text-text-tertiary opacity-60"
        >
          <Image src={iconSrc} alt="" width={38} height={38} className="size-9 object-contain opacity-70" aria-hidden />
          <span className="text-[11px] font-semibold leading-tight">{label}</span>
          <span className="sr-only">{unavailableLabel ?? "Action unavailable"}</span>
        </span>
      </li>
    );
  }

  if (mode === "internal") {
    return (
      <li className="flex-1">
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          aria-label={label}
          className={focusCls}
          onClick={onActivate}
        >
          {inner}
        </Link>
      </li>
    );
  }

  const external = mode === "external";
  return (
    <li className="flex-1">
      <a
        href={href}
        aria-label={srHint ? `${label} — ${srHint}` : label}
        className={focusCls}
        onClick={onActivate}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(mode === "download" ? { download: downloadName ?? true } : {})}
      >
        {inner}
        {srHint ? <span className="sr-only">{srHint}</span> : null}
      </a>
    </li>
  );
}
