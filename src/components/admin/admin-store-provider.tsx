"use client";

import { useEffect, useState } from "react";
import { hydrateAdminStore } from "@/lib/storage/demo-store";
import type { AdminSnapshot } from "@/data/admin/types";
import { Icon } from "@/components/shared/icon";

/**
 * Hydrates the admin store cache from a database snapshot loaded server-side.
 *
 * - When `dbBacked` is true, it seeds the store in a client effect and gates
 *   admin pages behind a brief loading state so their synchronous reads always
 *   see hydrated data (and never a server/client mismatch).
 * - When false (no database configured), the store stays in localStorage demo
 *   mode and children render immediately.
 */
export function AdminStoreProvider({
  dbBacked,
  snapshot,
  children,
}: {
  dbBacked: boolean;
  snapshot: AdminSnapshot | null;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(!dbBacked);

  useEffect(() => {
    if (dbBacked && snapshot) hydrateAdminStore(snapshot);
    setReady(true);
  }, [dbBacked, snapshot]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Icon name="LoaderCircle" className="size-4 animate-spin" aria-hidden />
          Loading workspace…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
