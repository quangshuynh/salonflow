"use client";

import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_NAME, DASHBOARD_NAV } from "@/lib/constants";

export function SiteHeader() {
  const pathname = usePathname();
  const current = DASHBOARD_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <span className="text-sm font-medium">{current?.title ?? APP_NAME}</span>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
