"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { DayTimeline } from "@/components/calendar/day-timeline";
import { NewAppointmentDialog } from "@/components/calendar/new-appointment-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getAppointmentsForDay,
  isSameLocalDay,
} from "@/features/appointments/queries";
import type { AppointmentFormValues } from "@/lib/validations/appointment";
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
  initialAppointments: AppointmentWithRelations[];
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
};

export function CalendarView({
  initialAppointments,
  customers,
  services,
  staff,
}: CalendarViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const dayAppointments = useMemo(
    () => getAppointmentsForDay(selectedDay, appointments),
    [appointments, selectedDay]
  );
  const isToday = isSameLocalDay(selectedDay, new Date());

  function handleCreate(values: AppointmentFormValues) {
    const customer = customers.find((c) => c.id === values.customerId);
    const service = services.find((s) => s.id === values.serviceId);
    const member = staff.find((s) => s.id === values.staffId);
    if (!customer || !service || !member) return;

    const startsAt = new Date(`${values.date}T${values.time}`);
    const endsAt = new Date(
      startsAt.getTime() + service.durationMin * 60_000
    );

    // Mock-data stage: insert locally. Becomes a Supabase insert in Sprint 4.
    const appointment: AppointmentWithRelations = {
      id: `apt-local-${Date.now()}`,
      customerId: customer.id,
      staffId: member.id,
      serviceId: service.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: "confirmed",
      customer,
      staff: member,
      service,
    };
    setAppointments((current) => [...current, appointment]);
    setSelectedDay(startsAt);
  }

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
          onCreate={handleCreate}
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
          {isToday && <span className="ml-1.5 text-muted-foreground">· Today</span>}
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
