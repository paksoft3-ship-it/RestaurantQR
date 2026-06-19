"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/navigation";
import { permissionsForRole, type Permission } from "@/domain/permissions";
import { routes } from "@/lib/routes";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/domain/entities";

interface AdminSidebarProps {
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

/**
 * Dark, grouped admin navigation. Active state from pathname, permission-aware,
 * collapsible. Part 2 items still link to their placeholder routes.
 */
export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-white/10 bg-navy text-white transition-[width] duration-200 lg:flex",
        collapsed ? "w-[76px]" : "w-64",
      )}
      aria-label="Admin navigation"
    >
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white">
          <Icon name="QrCode" className="size-5" aria-hidden />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate font-heading text-button font-bold">YourPlatform</p>
            <p className="truncate text-xs text-white/50">Admin Console</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {adminNav.map((group) => {
          const visibleItems = group.items.filter((item) => userCan(user, item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              {!collapsed ? (
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                  {group.label}
                </p>
              ) : (
                <div className="mx-2 mb-2 border-t border-white/10" aria-hidden />
              )}
              <ul className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                          active
                            ? "bg-primary text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        <Icon name={item.icon} className="size-5 shrink-0" aria-hidden />
                        {!collapsed ? (
                          <span className="flex-1 truncate">{item.label}</span>
                        ) : null}
                        {!collapsed && item.partTwo ? (
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/60">
                            P2
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] px-3 text-small font-medium text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
        >
          <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} className="size-5" aria-hidden />
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
