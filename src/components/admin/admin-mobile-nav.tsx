"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/navigation";
import { permissionsForRole, type Permission } from "@/domain/permissions";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/domain/entities";

interface AdminMobileNavProps {
  user: AdminUser;
}

function userCan(user: AdminUser, permission?: Permission): boolean {
  if (!permission) return true;
  const granted = user.permissions.length > 0 ? user.permissions : permissionsForRole(user.role);
  return granted.includes(permission);
}

function isActive(pathname: string, href: string): boolean {
  if (href === routes.admin.dashboard()) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile slide-in drawer mirroring the sidebar navigation. */
export function AdminMobileNav({ user }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-[10px] border border-border bg-canvas text-text-primary hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Icon name="Menu" className="size-5" aria-hidden />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-navy-deep/60"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-navy text-white shadow-lift"
          >
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-white">
                  <Icon name="QrCode" className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-heading text-button font-bold">YourPlatform</p>
                  <p className="text-xs text-white/50">Admin Console</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-[10px] text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close menu"
              >
                <Icon name="X" className="size-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {adminNav.map((group) => {
                const visibleItems = group.items.filter((item) => userCan(user, item.permission));
                if (visibleItems.length === 0) return null;
                return (
                  <div key={group.label} className="mb-5">
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                      {group.label}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                      {visibleItems.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-small font-medium",
                                active
                                  ? "bg-primary text-white"
                                  : "text-white/70 hover:bg-white/10 hover:text-white",
                              )}
                            >
                              <Icon name={item.icon} className="size-5 shrink-0" aria-hidden />
                              <span className="flex-1 truncate">{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
