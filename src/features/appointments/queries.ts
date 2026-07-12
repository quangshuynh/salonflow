import {
  MOCK_APPOINTMENTS,
  MOCK_CUSTOMERS,
  MOCK_SERVICES,
  MOCK_STAFF,
} from "@/lib/mock-data";
import type { AppointmentWithRelations } from "@/types";

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getAppointmentsWithRelations(): AppointmentWithRelations[] {
  return MOCK_APPOINTMENTS.flatMap((appointment) => {
    const customer = MOCK_CUSTOMERS.find((c) => c.id === appointment.customerId);
    const staff = MOCK_STAFF.find((s) => s.id === appointment.staffId);
    const service = MOCK_SERVICES.find((s) => s.id === appointment.serviceId);
    if (!customer || !staff || !service) return [];
    return [{ ...appointment, customer, staff, service }];
  });
}

export function getAppointmentsForDay(
  day: Date,
  appointments: AppointmentWithRelations[] = getAppointmentsWithRelations()
): AppointmentWithRelations[] {
  return appointments
    .filter((appointment) => isSameLocalDay(new Date(appointment.startsAt), day))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getTodaysAppointments(): AppointmentWithRelations[] {
  return getAppointmentsForDay(new Date());
}
