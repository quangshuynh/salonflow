import Link from "next/link";

import { MobileNav } from "@/components/marketing/mobile-nav";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME, MARKETING_NAV } from "@/lib/constants";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BrandLogo size={28} decorative />
          {APP_NAME}
        </Link>
        <nav
          aria-label="Main"
          className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex"
        >
          {MARKETING_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Open dashboard
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
