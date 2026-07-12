import { CalendarClock, Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { STAFF_ROLE_LABELS } from "@/features/staff/constants";
import type { StaffWithTodaysLoad } from "@/features/staff/queries";
import { formatCurrency, formatTime } from "@/lib/utils";

export function StaffCard({ staff }: { staff: StaffWithTodaysLoad }) {
  const workingToday = staff.bookingsToday > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{staff.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{staff.name}</p>
            <Badge variant="secondary" className="mt-1">
              {STAFF_ROLE_LABELS[staff.role]}
            </Badge>
          </div>
          <Badge variant={workingToday ? "default" : "outline"}>
            {workingToday ? "Working" : "Off today"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-4" />
            {staff.bookingsToday}{" "}
            {staff.bookingsToday === 1 ? "booking" : "bookings"} today
          </span>
          <span className="font-medium tabular-nums">
            {formatCurrency(staff.revenueToday)}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" />
          {staff.nextAppointment
            ? `Next at ${formatTime(staff.nextAppointment.startsAt)} — ${staff.nextAppointment.service.name}`
            : workingToday
              ? "Done for today"
              : "No bookings today"}
        </p>
      </CardContent>
    </Card>
  );
}
