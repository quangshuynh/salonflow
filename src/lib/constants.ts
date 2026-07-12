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

export const DASHBOARD_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Appointments", href: "/appointments", icon: CalendarClock },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Staff", href: "/staff", icon: UserCog },
  { title: "Services", href: "/services", icon: Scissors },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];
