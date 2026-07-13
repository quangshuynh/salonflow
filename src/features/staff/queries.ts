import "server-only";

import { getTodaysAppointments } from "@/features/appointments/queries";
import { getSupabaseEnv } from "@/lib/db/env";
import { mapStaff, type StaffRow } from "@/lib/db/mappers";
import { MOCK_STAFF } from "@/lib/mock-data";
import { createClient } from "@/lib/db/server";
import type { AppointmentWithRelations, StaffMember } from "@/types";

export async function getStaff(): Promise<StaffMember[]> {
  if (!getSupabaseEnv()) return MOCK_STAFF;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as StaffRow[]).map(mapStaff);
}

export type StaffWithTodaysLoad = StaffMember & {
  bookingsToday: number;
  revenueToday: number;
  nextAppointment: AppointmentWithRelations | null;
};

export async function getStaffWithTodaysLoad(): Promise<StaffWithTodaysLoad[]> {
  const [staff, todays] = await Promise.all([
    getStaff(),
    getTodaysAppointments(),
  ]);
  const active = todays.filter(
    (a) => a.status !== "cancelled" && a.status !== "no-show"
  );
  const now = new Date();

  return staff.map((member) => {
    const own = active.filter((a) => a.staffId === member.id);
    const nextAppointment =
      own.find(
        (a) => a.status !== "completed" && new Date(a.startsAt) > now
      ) ?? null;

    return {
      ...member,
      bookingsToday: own.length,
      revenueToday: own.reduce((sum, a) => sum + a.service.price, 0),
      nextAppointment,
    };
  });
}
