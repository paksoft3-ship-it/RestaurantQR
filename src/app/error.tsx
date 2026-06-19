"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center" role="alert">
      <h1 className="font-heading text-h2 text-text-primary">Something needs a retry</h1>
      <p className="max-w-md text-body text-text-secondary">
        We hit an unexpected problem loading this page. Your data is safe — please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
