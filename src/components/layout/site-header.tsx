"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOut } from "@/features/auth/actions";
import { APP_NAME, DASHBOARD_NAV } from "@/lib/constants";

export type HeaderUser = {
  email: string;
  name: string;
};

function initials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const current = DASHBOARD_NAV.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  const avatar = (
    <Avatar className="size-8">
      <AvatarFallback>{user ? initials(user.name) : "SF"}</AvatarFallback>
    </Avatar>
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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label="Account menu"
            >
              {avatar}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span className="block">{user.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => startTransition(() => signOut())}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          avatar
        )}
      </div>
    </header>
  );
}
