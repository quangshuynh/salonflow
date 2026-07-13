import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Built for beauty
          businesses.
        </p>
        <nav className="flex items-center gap-6">
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
