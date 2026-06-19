import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhonePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

/** A single phone-framed image preview. */
export function PhonePreview({ src, alt, className }: PhonePreviewProps) {
  return (
    <div
      className={cn(
        "relative w-44 shrink-0 overflow-hidden rounded-[24px] border-4 border-navy bg-navy shadow-lift",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={176}
        height={360}
        className="h-auto w-full object-cover"
      />
    </div>
  );
}

interface PhonePreviewStackProps {
  items: { src: string; alt: string }[];
  className?: string;
}

/** Overlapping phone previews used as a hero visual. */
export function PhonePreviewStack({ items, className }: PhonePreviewStackProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden={false}>
      {items.map((item, index) => (
        <PhonePreview
          key={item.alt}
          src={item.src}
          alt={item.alt}
          className={cn(
            index === 1 && "z-10 -translate-y-4 md:-translate-y-6",
            index === 0 && "rotate-[-6deg]",
            index === 2 && "rotate-[6deg]",
          )}
        />
      ))}
    </div>
  );
}
