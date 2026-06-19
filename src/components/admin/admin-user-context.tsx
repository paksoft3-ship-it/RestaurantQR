"use client";

import { createContext, useContext } from "react";
import type { AdminUser } from "@/domain/entities";

const AdminUserContext = createContext<AdminUser | null>(null);

/** Provides the current admin user to client components (UX-only permission checks). */
export function AdminUserProvider({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  return <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>;
}

/** Read the current admin user inside client components. */
export function useAdminUser(): AdminUser | null {
  return useContext(AdminUserContext);
}
