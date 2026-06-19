import type { Permission } from "@/domain/permissions";
import type { AdminUser } from "@/domain/entities";
import { permissionsForRole } from "@/domain/permissions";

interface PermissionGateProps {
  user: AdminUser | null;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function can(user: AdminUser | null, permission: Permission): boolean {
  if (!user) return false;
  const granted = user.permissions.length > 0 ? user.permissions : permissionsForRole(user.role);
  return granted.includes(permission);
}

/**
 * UX-only permission gate. Server boundaries remain the source of truth; this
 * only hides actions the current user cannot perform.
 */
export function PermissionGate({ user, permission, children, fallback = null }: PermissionGateProps) {
  return <>{can(user, permission) ? children : fallback}</>;
}
