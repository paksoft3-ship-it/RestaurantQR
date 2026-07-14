import { appConfig } from "@/lib/config/app-config";
import { Icon } from "@/components/shared/icon";

/** Full-screen "we'll be back" page shown to public visitors during maintenance. */
export function MaintenanceScreen() {
  const support = appConfig.support?.email ?? null;
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-warm text-primary">
        <Icon name="Wrench" className="size-7" aria-hidden />
      </span>
      <h1 className="font-heading text-h2 text-text-primary">We&apos;ll be right back</h1>
      <p className="max-w-md text-body text-text-secondary">
        {appConfig.appName} is undergoing scheduled maintenance. Please check back shortly.
      </p>
      {support ? (
        <p className="text-small text-text-tertiary">
          Need help?{" "}
          <a href={`mailto:${support}`} className="font-semibold text-primary hover:underline">
            {support}
          </a>
        </p>
      ) : null}
    </div>
  );
}
