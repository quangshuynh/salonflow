"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { DayTimeline } from "@/components/calendar/day-timeline";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  filterAppointmentsForDay,
  isSameLocalDay,
} from "@/features/appointments/helpers";
import type {
  AppointmentWithRelations,
  Customer,
  Service,
  StaffMember,
} from "@/types";

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

type CalendarViewProps = {
  appointments: AppointmentWithRelations[];
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
};

export function CalendarView({
  appointments,
  customers,
  services,
  staff,
}: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const dayAppointments = useMemo(
    () => filterAppointmentsForDay(appointments, selectedDay),
    [appointments, selectedDay]
  );
  const isToday = isSameLocalDay(selectedDay, new Date());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Daily timeline of appointments per staff member."
      >
        <NewAppointmentDialog
          customers={customers}
          services={services}
          staff={staff}
          defaultDate={selectedDay}
          onBooked={(startsAt) => setSelectedDay(startsAt)}
        />
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous day"
          onClick={() => setSelectedDay((day) => addDays(day, -1))}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next day"
          onClick={() => setSelectedDay((day) => addDays(day, 1))}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isToday}
          onClick={() => setSelectedDay(new Date())}
        >
          Today
        </Button>
        <h2 className="ml-2 text-sm font-medium">
          {formatDayLabel(selectedDay)}
          {isToday && (
            <span className="ml-1.5 text-muted-foreground">· Today</span>
          )}
        </h2>
        <p className="ml-auto text-sm text-muted-foreground">
          {dayAppointments.length}{" "}
          {dayAppointments.length === 1 ? "appointment" : "appointments"}
        </p>
      </div>

      <DayTimeline
        day={selectedDay}
        staff={staff}
        appointments={dayAppointments}
      />
    </div>
  );
}
