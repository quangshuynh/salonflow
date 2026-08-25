import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6">
      {/*
        At this size the logo's own wordmark is legible, so it stands alone
        rather than repeating the product name beside it.
      */}
      <Link
        href="/"
        aria-label="SalonFlow home"
        className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <BrandLogo size={64} decorative className="rounded-xl" />
      </Link>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
