import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Scissors,
  UserCog,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarDays,
    title: "Daily timeline",
    description:
      "See every chair and every hour at a glance, with a live view of the day per staff member.",
  },
  {
    icon: CalendarClock,
    title: "Fast scheduling",
    description:
      "Book a customer, service, and staff member in seconds — durations and end times are handled for you.",
  },
  {
    icon: Users,
    title: "Customer directory",
    description:
      "Visit history, spend, and contact details for every client, searchable in one place.",
  },
  {
    icon: UserCog,
    title: "Staff workload",
    description:
      "Know who's booked, who's free, and what each team member brought in today.",
  },
  {
    icon: Scissors,
    title: "Service menu",
    description:
      "Your full menu with durations and prices, organized by category and easy to update.",
  },
  {
    icon: BarChart3,
    title: "Revenue reports",
    description:
      "Daily revenue trends, top services, and staff performance without a spreadsheet.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Everything the front desk does, in one tab
        </h2>
        <p className="mt-3 text-muted-foreground">
          SalonFlow replaces the paper book, the spreadsheet, and the group
          chat.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4.5" />
            </div>
            <h3 className="mt-4 font-medium">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
