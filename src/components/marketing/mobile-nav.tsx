"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAME, MARKETING_NAV } from "@/lib/constants";

/**
 * Marketing navigation for viewports too narrow for the inline links.
 * Without this the Features and Pricing sections are unreachable on a phone.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open menu" />
        }
        className="sm:hidden"
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BrandLogo size={28} decorative />
            {APP_NAME}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2" aria-label="Main">
          {MARKETING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {item.title}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
