"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/states";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for diagnostics; never throw away the error silently.
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="Something went wrong"
        description="This admin section failed to load. You can retry without losing your session."
        action={{ label: "Try again", onClick: () => reset() }}
      />
    </div>
  );
}
