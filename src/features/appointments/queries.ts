import "server-only";

import { filterAppointmentsForDay } from "@/features/appointments/helpers";
import { getSupabaseEnv } from "@/lib/db/env";
import {
  mapAppointmentWithRelations,
  type AppointmentJoinedRow,
} from "@/lib/db/mappers";
import {
  MOCK_APPOINTMENTS,
  MOCK_CUSTOMERS,
  MOCK_SERVICES,
  MOCK_STAFF,
} from "@/lib/mock-data";
import { createClient } from "@/lib/db/server";
import type { AppointmentWithRelations } from "@/types";

/** Joins the mock tables in memory — the demo-mode data source. */
export function getMockAppointmentsWithRelations(): AppointmentWithRelations[] {
  return MOCK_APPOINTMENTS.flatMap((appointment) => {
    const customer = MOCK_CUSTOMERS.find((c) => c.id === appointment.customerId);
    const staff = MOCK_STAFF.find((s) => s.id === appointment.staffId);
    const service = MOCK_SERVICES.find((s) => s.id === appointment.serviceId);
    if (!customer || !staff || !service) return [];
    return [{ ...appointment, customer, staff, service }];
  });
}

export function filterMockAppointments(
  predicate: (appointment: AppointmentWithRelations) => boolean
): AppointmentWithRelations[] {
  return getMockAppointmentsWithRelations().filter(predicate);
}

export async function getAppointmentsWithRelations(): Promise<
  AppointmentWithRelations[]
> {
  if (!getSupabaseEnv()) return getMockAppointmentsWithRelations();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, customer:customers(*), staff:staff(*), service:services(*)")
    .order("starts_at");
  if (error) throw error;
  return (data as AppointmentJoinedRow[]).map(mapAppointmentWithRelations);
}

export async function getTodaysAppointments(): Promise<
  AppointmentWithRelations[]
> {
  return filterAppointmentsForDay(await getAppointmentsWithRelations(), new Date());
}
