"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/shared/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  APP_NAME,
  NAV_GROUPS,
  SETTINGS_NAV,
  isNavItemActive,
} from "@/lib/constants";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => isNavItemActive(href, pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              {/* Reads as an app icon at this size; the name sits beside it. */}
              <BrandLogo size={32} decorative />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{APP_NAME}</span>
                <span className="truncate text-xs text-muted-foreground">
                  Salon management
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive(item.href)}
                      render={
                        <Link
                          href={item.href}
                          aria-current={
                            isActive(item.href) ? "page" : undefined
                          }
                        />
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={SETTINGS_NAV.title}
              isActive={isActive(SETTINGS_NAV.href)}
              render={
                <Link
                  href={SETTINGS_NAV.href}
                  aria-current={
                    isActive(SETTINGS_NAV.href) ? "page" : undefined
                  }
                />
              }
            >
              <SETTINGS_NAV.icon />
              <span>{SETTINGS_NAV.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
