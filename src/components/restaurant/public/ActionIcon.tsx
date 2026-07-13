import Image from "next/image";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

/** An icon value is an uploaded image when it looks like a URL/path. */
export function isImageIcon(icon: string | null | undefined): boolean {
  if (!icon) return false;
  return icon.startsWith("http") || icon.startsWith("/");
}

interface ActionIconProps {
  /** Admin override: a lucide icon name or an image URL. Null = use fallback. */
  icon?: string | null;
  /** Default image (PNG) shown when there is no override. */
  fallbackSrc?: string;
  /** Default lucide name shown when there is no override and no fallback image. */
  fallbackIcon?: string;
  /** Pixel size for the square icon box. */
  size?: number;
  className?: string;
  imgClassName?: string;
}

/**
 * Render a restaurant-action icon from an admin override (image URL or lucide
 * name) with a built-in fallback. Shared by the fixed bottom bar and the
 * floating "+" menu so both honor the same override rules.
 */
export function ActionIcon({
  icon,
  fallbackSrc,
  fallbackIcon,
  size = 36,
  className,
  imgClassName,
}: ActionIconProps) {
  const override = icon?.trim() || null;

  if (override && isImageIcon(override)) {
    return (
      <Image
        src={override}
        alt=""
        width={size}
        height={size}
        className={cn("object-contain", imgClassName)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  if (override) {
    return <Icon name={override} className={className} aria-hidden />;
  }

  if (fallbackSrc) {
    return (
      <Image
        src={fallbackSrc}
        alt=""
        width={size}
        height={size}
        className={cn("object-contain", imgClassName)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return <Icon name={fallbackIcon ?? "Circle"} className={className} aria-hidden />;
}
