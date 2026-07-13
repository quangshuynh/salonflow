"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";

import { NewAppointmentDialog } from "@/components/appointments/new-appointment-dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildLocalAppointment } from "@/features/appointments/build-appointment";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/features/appointments/constants";
import type { AppointmentFormValues } from "@/lib/validations/appointment";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type {
  AppointmentStatus,
  AppointmentWithRelations,
  Customer,
  Service,
  StaffMember,
} from "@/types";

const STATUS_FILTER_ITEMS: Record<string, string> = {
  all: "All statuses",
  ...APPOINTMENT_STATUS_LABELS,
};

type AppointmentsViewProps = {
  initialAppointments: AppointmentWithRelations[];
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
};

export function AppointmentsView({
  initialAppointments,
  customers,
  services,
  staff,
}: AppointmentsViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments
      .filter((appointment) => {
        if (status !== "all" && appointment.status !== status) return false;
        if (q && !appointment.customer.name.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  }, [appointments, query, status]);

  function handleCreate(values: AppointmentFormValues) {
    const appointment = buildLocalAppointment(values, {
      customers,
      services,
      staff,
    });
    if (!appointment) return;
    setAppointments((current) => [...current, appointment]);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Appointments"
        description={`${appointments.length} appointments on the books.`}
      >
        <NewAppointmentDialog
          customers={customers}
          services={services}
          staff={staff}
          defaultDate={new Date()}
          onCreate={handleCreate}
        />
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 basis-56">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer..."
            className="pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status}
          onValueChange={(value) =>
            setStatus((value ?? "all") as AppointmentStatus | "all")
          }
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {APPOINTMENT_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {APPOINTMENT_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No appointments found"
          description="Try a different search or status filter."
        />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Service
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Staff</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium tabular-nums">
                      {formatDate(appointment.startsAt)}{" "}
                      <span className="text-muted-foreground">
                        {formatTime(appointment.startsAt)}
                      </span>
                    </TableCell>
                    <TableCell>{appointment.customer.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {appointment.service.name}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {appointment.staff.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(appointment.service.price)}
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
      )}
    </div>
  );
}
