import {
  BarChart3,
  Calendar,
  CalendarClock,
  LayoutDashboard,
  Scissors,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export const APP_NAME = "SalonFlow";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Public marketing links, shared by the navbar, mobile menu, and footer. */
export const MARKETING_NAV: { title: string; href: string }[] = [
  { title: "Features", href: "/#features" },
  { title: "Pricing", href: "/#pricing" },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Calendar", href: "/calendar", icon: Calendar },
      { title: "Appointments", href: "/appointments", icon: CalendarClock },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Staff", href: "/staff", icon: UserCog },
      { title: "Services", href: "/services", icon: Scissors },
    ],
  },
  {
    label: "Insights",
    items: [{ title: "Reports", href: "/reports", icon: BarChart3 }],
  },
];

export const SETTINGS_NAV: NavItem = {
  title: "Settings",
  href: "/settings",
  icon: Settings,
};

/** Flat list of every dashboard route, used for title lookups. */
export const DASHBOARD_NAV: NavItem[] = [
  ...NAV_GROUPS.flatMap((group) => group.items),
  SETTINGS_NAV,
];

/**
 * A nav item is active on its own route and on anything nested beneath it,
 * so `/customers/cus-1` keeps "Customers" highlighted.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The dashboard nav item matching a pathname, used for the header title. */
export function getActiveNavItem(pathname: string): NavItem | undefined {
  return DASHBOARD_NAV.find((item) => isNavItemActive(item.href, pathname));
}
