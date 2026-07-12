import { getTodaysAppointments } from "@/features/appointments/queries";
import { MOCK_STAFF } from "@/lib/mock-data";
import type { AppointmentWithRelations, StaffMember } from "@/types";

export type StaffWithTodaysLoad = StaffMember & {
  bookingsToday: number;
  revenueToday: number;
  nextAppointment: AppointmentWithRelations | null;
};

export function getStaffWithTodaysLoad(): StaffWithTodaysLoad[] {
  const todays = getTodaysAppointments().filter(
    (a) => a.status !== "cancelled" && a.status !== "no-show"
  );
  const now = new Date();

  return MOCK_STAFF.map((staff) => {
    const own = todays.filter((a) => a.staffId === staff.id);
    const nextAppointment =
      own.find(
        (a) => a.status !== "completed" && new Date(a.startsAt) > now
      ) ?? null;

    return {
      ...staff,
      bookingsToday: own.length,
      revenueToday: own.reduce((sum, a) => sum + a.service.price, 0),
      nextAppointment,
    };
  });
}
