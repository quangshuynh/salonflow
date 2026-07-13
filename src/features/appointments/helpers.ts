import type { AppointmentWithRelations } from "@/types";

/** Pure date/appointment helpers safe to import from client components. */

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function filterAppointmentsForDay(
  appointments: AppointmentWithRelations[],
  day: Date
): AppointmentWithRelations[] {
  return appointments
    .filter((appointment) => isSameLocalDay(new Date(appointment.startsAt), day))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
