import Link from "next/link";
import { footerNav } from "@/lib/navigation";
import { routes } from "@/lib/routes";
import { appConfig, displayValue } from "@/lib/config/app-config";

const COLUMNS: { heading: string; key: keyof typeof footerNav }[] = [
  { heading: "Platform", key: "platform" },
  { heading: "Company", key: "company" },
  { heading: "Legal", key: "legal" },
];

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-page grid-cols-1 gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="font-display text-h3 font-extrabold">{appConfig.appName}</div>
          <p className="mt-3 max-w-xs text-small text-white/60">
            Professionally managed digital menus and QR/NFC infrastructure for modern restaurants.
          </p>
          <p className="mt-4 text-xs text-white/50">
            Support: {displayValue(appConfig.support.email)}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.key}>
            <h2 className="text-small font-bold text-white">{col.heading}</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {footerNav[col.key].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-small text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-page flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-white/50 md:flex-row md:items-center md:px-8">
          <p>
            © {year} {displayValue(appConfig.business.legalName, appConfig.appName)}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>Managed service · No restaurant-owner accounts</span>
            <Link href={routes.admin.login()} className="hover:text-white/80">
              Staff access
            </Link>
          </div>
        </div>
      </div>

      {/* Developed-by badge — theme colours (primary → accent on hover). */}
      <div className="border-t border-white/10 py-4">
        <a
          href="https://paksoft.com.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto flex w-fit items-center gap-2 text-sm"
        >
          <span className="text-white/50 transition-colors group-hover:text-white">Developed by</span>
          <span className="flex items-center gap-1 text-primary transition-colors group-hover:text-accent">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-5 -rotate-12">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.08-1.38-.7.13-1.42.21-2.16.21-5.52 0-10-4.48-10-10S9.42 2.83 14.92 2.83c.74 0 1.46.08 2.16.21C15.58 2.5 13.85 2 12 2z" />
            </svg>
            <span className="text-base font-bold tracking-wide">PakSoft</span>
          </span>
        </a>
      </div>
    </footer>
  );
}
