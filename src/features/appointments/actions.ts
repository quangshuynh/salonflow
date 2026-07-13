"use server";

import { revalidatePath } from "next/cache";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/lib/validations/appointment";

export type ActionResult = { error?: string };

export async function createAppointment(
  values: AppointmentFormValues
): Promise<ActionResult> {
  const parsed = appointmentSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to book appointments." };
  }

  const supabase = await createClient();

  // Derive the end time server-side from the service's duration — the
  // client is never trusted with it.
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_min")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();
  if (serviceError) return { error: serviceError.message };
  if (!service) return { error: "Selected service no longer exists." };

  const startsAt = new Date(`${parsed.data.date}T${parsed.data.time}`);
  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000);

  const { error } = await supabase.from("appointments").insert({
    business_id: await getBusinessId(),
    customer_id: parsed.data.customerId,
    staff_id: parsed.data.staffId,
    service_id: parsed.data.serviceId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "confirmed",
  });
  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return {};
}
