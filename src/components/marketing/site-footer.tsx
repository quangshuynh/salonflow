import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { APP_NAME, MARKETING_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandLogo size={32} decorative />
          <div>
            <p className="font-medium text-foreground">{APP_NAME}</p>
            <p className="text-xs">Built for beauty businesses.</p>
          </div>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          {MARKETING_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.title}
            </Link>
          ))}
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-5xl border-t px-4 py-4 text-xs text-muted-foreground sm:px-6">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Demo application running on
          sample data.
        </p>
      </div>
    </footer>
  );
}
