import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";

interface CtaSectionProps {
  title: string;
  description?: string;
  primary: { label: string; href: string; icon?: string };
  secondary?: { label: string; href: string; icon?: string };
  tone?: "primary" | "dark";
  className?: string;
}

/** Full-width call-to-action band used to close marketing pages. */
export function CtaSection({
  title,
  description,
  primary,
  secondary,
  tone = "primary",
  className,
}: CtaSectionProps) {
  return (
    <section className={cn("py-16 md:py-20", className)}>
      <Container>
        <div
          className={cn(
            "flex flex-col items-center gap-6 rounded-[20px] px-6 py-12 text-center md:px-12",
            tone === "primary" ? "bg-primary text-white" : "bg-navy text-white",
          )}
        >
          <h2 className="max-w-2xl font-display text-h1 text-white">{title}</h2>
          {description ? <p className="max-w-xl text-body text-white/85">{description}</p> : null}
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href={primary.href}>
                {primary.label}
                {primary.icon ? <Icon name={primary.icon} aria-hidden /> : null}
              </Link>
            </Button>
            {secondary ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={secondary.href}>
                  {secondary.icon ? <Icon name={secondary.icon} aria-hidden /> : null}
                  {secondary.label}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
