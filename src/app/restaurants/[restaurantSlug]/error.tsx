"use client";

import { useEffect } from "react";
import { Container } from "@/components/shared/container";
import { ErrorState } from "@/components/shared/states";

export default function RestaurantError({
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
    <Container className="py-16">
      <ErrorState
        title="This page didn't load"
        description="Something went wrong while loading this restaurant page. Please try again."
        action={{ label: "Try again", onClick: reset }}
      />
    </Container>
  );
}
