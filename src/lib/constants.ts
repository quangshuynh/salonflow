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
