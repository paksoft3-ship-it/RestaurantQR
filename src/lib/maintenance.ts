import "server-only";
import { getRepositories } from "@/data/repositories";
import { getCurrentAdminUser } from "@/lib/auth";

/**
 * True when the platform maintenance mode is on AND the current viewer is not a
 * logged-in admin (admins bypass so they can keep working during maintenance).
 */
export async function maintenanceActive(): Promise<boolean> {
  try {
    const settings = await getRepositories().content.settings();
    if (!settings.maintenanceMode) return false;
    const admin = await getCurrentAdminUser();
    return !admin;
  } catch {
    return false;
  }
}
