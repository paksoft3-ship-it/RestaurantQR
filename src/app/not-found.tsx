import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-display text-display text-primary">404</span>
      <h1 className="font-heading text-h2 text-text-primary">Page not found</h1>
      <p className="max-w-md text-body text-text-secondary">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild>
        <Link href={routes.marketing.home()}>Back to home</Link>
      </Button>
    </main>
  );
}
