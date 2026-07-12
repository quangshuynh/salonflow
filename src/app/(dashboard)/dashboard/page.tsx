import {
  CalendarClock,
  CalendarPlus,
  Clock,
  DollarSign,
  UserPlus,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getDashboardStats,
  getTopServicesToday,
} from "@/features/analytics/queries";
import { getTodaysAppointments } from "@/features/appointments/queries";
import { formatCurrency, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const appointments = getTodaysAppointments();
  const topServices = getTopServicesToday();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of today's appointments, revenue, and activity."
      >
        <Button>
          <CalendarPlus data-icon="inline-start" />
          New appointment
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Revenue today"
          value={formatCurrency(stats.revenueToday)}
          hint="From completed appointments"
          icon={DollarSign}
        />
        <StatCard
          title="Appointments today"
          value={String(stats.appointmentsToday)}
          hint="Excluding cancellations"
          icon={CalendarClock}
        />
        <StatCard
          title="Still to come"
          value={String(stats.upcomingToday)}
          hint="Later today"
          icon={Clock}
        />
        <StatCard
          title="New customers"
          value={String(stats.newCustomersThisWeek)}
          hint="In the last 7 days"
          icon={UserPlus}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s schedule</CardTitle>
            <CardDescription>
              All appointments booked for today, in order.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden md:table-cell">Staff</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium tabular-nums">
                      {formatTime(appointment.startsAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-xs">
                            {appointment.customer.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{appointment.customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {appointment.service.name}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {appointment.staff.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top services today</CardTitle>
            <CardDescription>Ranked by booked revenue.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topServices.map(({ service, bookings, revenue }) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {bookings} {bookings === 1 ? "booking" : "bookings"}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
