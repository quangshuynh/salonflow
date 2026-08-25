"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { badgeVariants } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from "@/features/auth/actions";
import { APP_NAME, getActiveNavItem } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";

export type HeaderUser = {
  email: string;
  name: string;
};

type SiteHeaderProps = {
  user: HeaderUser | null;
  /** Sample-data mode: mutations aren't persisted. */
  demoMode?: boolean;
};

export function SiteHeader({ user, demoMode = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const current = getActiveNavItem(pathname);

  const avatar = (
    <Avatar className="size-8">
      <AvatarFallback aria-hidden>
        {user ? getInitials(user.name) : "SF"}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <span className="truncate text-sm font-medium">
        {current?.title ?? APP_NAME}
      </span>
      {demoMode && (
        <Tooltip>
          {/* A real button so the explanation is reachable by keyboard too. */}
          <TooltipTrigger
            className={cn(
              badgeVariants({ variant: "secondary" }),
              "hidden cursor-default sm:inline-flex"
            )}
          >
            Demo data
          </TooltipTrigger>
          <TooltipContent>
            Sample data for exploring the app. Changes aren&apos;t saved.
          </TooltipContent>
        </Tooltip>
      )}
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
