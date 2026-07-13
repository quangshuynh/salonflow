import "server-only";

import { filterMockAppointments } from "@/features/appointments/queries";
import { getSupabaseEnv } from "@/lib/db/env";
import {
  mapAppointmentWithRelations,
  mapCustomer,
  type AppointmentJoinedRow,
  type CustomerRow,
  type CustomerStatsRow,
} from "@/lib/db/mappers";
import { MOCK_CUSTOMERS } from "@/lib/mock-data";
import { createClient } from "@/lib/db/server";
import type { AppointmentWithRelations, Customer } from "@/types";

export async function getCustomers(): Promise<Customer[]> {
  if (!getSupabaseEnv()) {
    return [...MOCK_CUSTOMERS].sort((a, b) => a.name.localeCompare(b.name));
  }

  const supabase = await createClient();
  const [{ data: rows, error }, { data: stats, error: statsError }] =
    await Promise.all([
      supabase.from("customers").select("*").order("name"),
      supabase.from("customer_stats").select("*"),
    ]);
  if (error) throw error;
  if (statsError) throw statsError;

  const statsById = new Map(
    (stats as CustomerStatsRow[]).map((s) => [s.customer_id, s])
  );
  return (rows as CustomerRow[]).map((row) =>
    mapCustomer(row, statsById.get(row.id))
  );
}

export async function getCustomerById(
  id: string
): Promise<Customer | undefined> {
  if (!getSupabaseEnv()) {
    return MOCK_CUSTOMERS.find((customer) => customer.id === id);
  }

  const supabase = await createClient();
  const [{ data: row, error }, { data: stats }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("customer_stats").select("*").eq("customer_id", id).maybeSingle(),
  ]);
  if (error) throw error;
  if (!row) return undefined;
  return mapCustomer(row as CustomerRow, (stats as CustomerStatsRow) ?? undefined);
}

export async function getCustomerAppointments(
  customerId: string
): Promise<AppointmentWithRelations[]> {
  if (!getSupabaseEnv()) {
    return filterMockAppointments((a) => a.customerId === customerId).sort(
      (a, b) => b.startsAt.localeCompare(a.startsAt)
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, customer:customers(*), staff:staff(*), service:services(*)")
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return (data as AppointmentJoinedRow[]).map(mapAppointmentWithRelations);
}
