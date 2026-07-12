import {
  MOCK_APPOINTMENTS,
  MOCK_CUSTOMERS,
  MOCK_SERVICES,
  MOCK_STAFF,
} from "@/lib/mock-data";
import type { AppointmentWithRelations } from "@/types";

function isSameLocalDay(a: Date, b: Date): boolean {
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

export function getTodaysAppointments(): AppointmentWithRelations[] {
  const today = new Date();
  return getAppointmentsWithRelations()
    .filter((appointment) => isSameLocalDay(new Date(appointment.startsAt), today))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
