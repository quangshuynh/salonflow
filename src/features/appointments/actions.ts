"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { APPOINTMENT_STATUS_TRANSITIONS } from "@/features/appointments/constants";
import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/lib/validations/appointment";
import type { AppointmentStatus } from "@/types";

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

const statusUpdateSchema = z.object({
  appointmentId: z.uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
});

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  const parsed = statusUpdateSchema.safeParse({ appointmentId, status });
  if (!parsed.success) return { error: "Invalid status update." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to manage appointments." };
  }

  const supabase = await createClient();

  // Enforce the transition rules server-side; the menu in the UI is
  // convenience, not the guard.
  const { data: current, error: fetchError } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();
  if (fetchError) return { error: fetchError.message };
  if (!current) return { error: "Appointment not found." };

  const allowed =
    APPOINTMENT_STATUS_TRANSITIONS[current.status as AppointmentStatus];
  if (!allowed.includes(parsed.data.status)) {
    return {
      error: `Can't move a ${current.status} appointment to ${parsed.data.status}.`,
    };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.appointmentId);
  if (error) return { error: error.message };

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return {};
}
