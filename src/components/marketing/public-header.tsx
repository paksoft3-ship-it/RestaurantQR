"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { marketingNav, primaryMarketingNav } from "@/lib/navigation";
import { routes } from "@/lib/routes";
import { appConfig } from "@/lib/config/app-config";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { LanguageSelector } from "@/components/shared/language-selector";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link
          href={routes.marketing.home()}
          className="font-display text-h2 font-extrabold text-primary-dark"
        >
          {appConfig.appName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
          {primaryMarketingNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap text-small font-semibold transition-colors hover:text-primary",
                  active ? "text-primary" : "text-text-secondary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector className="hidden xl:inline-flex" />
          <Button asChild variant="ghost" size="sm" className="hidden whitespace-nowrap xl:inline-flex">
            <Link href={routes.restaurant.home("pizza-house")}>View Demo</Link>
          </Button>
          <Button asChild size="sm" className="whitespace-nowrap">
            <Link href={routes.marketing.contact()}>Request a Quote</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[12px] text-text-primary lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "X" : "Menu"} className="size-7" aria-hidden />
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-canvas lg:hidden">
          <nav aria-label="Mobile" className="mx-auto flex max-w-page flex-col px-5 py-3">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[10px] px-3 py-3 text-body font-semibold text-text-primary hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Button asChild variant="secondary">
                <Link href={routes.restaurant.home("pizza-house")} onClick={() => setOpen(false)}>
                  View Demo
                </Link>
              </Button>
              <Button asChild>
                <Link href={routes.marketing.contact()} onClick={() => setOpen(false)}>
                  Request a Quote
                </Link>
              </Button>
              <LanguageSelector className="px-1 pt-1" />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
