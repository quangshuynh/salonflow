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

/**
 * Messages returned to the browser. Raw database errors stay on the server:
 * they name tables, constraints, and policies, and tell the user nothing
 * they can act on. The tenant boundary itself is enforced in PostgreSQL —
 * RLS for the appointment row, composite foreign keys (0003) for what it
 * references — and these only translate its answers.
 */
/** Same answer whether the row never existed or belongs to another tenant. */
const NOT_FOUND = "Appointment not found.";
const CHANGED =
  "This appointment was changed or removed in the meantime. Refresh and try again.";
/** 23503: a referenced row is outside the caller's business, or gone. */
const REFERENCE_UNAVAILABLE =
  "The selected customer, staff member, or service is no longer available. Refresh and try again.";
const NO_BUSINESS =
  "Your account isn't linked to a business. Sign in again or finish onboarding.";
const BOOKING_FAILED = "Couldn't book the appointment. Try again.";
const UPDATE_FAILED = "Couldn't update the appointment. Try again.";

type DbError = { code?: string; message: string };

function logDbError(action: string, error: DbError) {
  console.error(`[appointments] ${action} failed`, {
    code: error.code,
    message: error.message,
  });
}

/** Server-side only: the form schema also accepts demo-mode mock ids. */
const referenceIdsSchema = z.object({
  customerId: z.uuid(),
  staffId: z.uuid(),
  serviceId: z.uuid(),
});

export async function createAppointment(
  values: AppointmentFormValues
): Promise<ActionResult> {
  const parsed = appointmentSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to book appointments." };
  }
  if (!referenceIdsSchema.safeParse(parsed.data).success) {
    return { error: "Check the form for errors." };
  }

  const supabase = await createClient();

  // Derive the end time server-side from the service's duration — the
  // client is never trusted with it. RLS hides another tenant's service, so
  // it reads exactly like one that was deleted.
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_min")
    .eq("id", parsed.data.serviceId)
    .maybeSingle();
  if (serviceError) {
    logDbError("service lookup", serviceError);
    return { error: BOOKING_FAILED };
  }
  if (!service) return { error: "Selected service no longer exists." };

  // The tenant comes from the caller's own profile, never from the request.
  let businessId: string;
  try {
    businessId = await getBusinessId();
  } catch (error) {
    console.error("[appointments] tenant resolution failed", error);
    return { error: NO_BUSINESS };
  }

  const startsAt = new Date(`${parsed.data.date}T${parsed.data.time}`);
  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000);

  const { error } = await supabase.from("appointments").insert({
    business_id: businessId,
    customer_id: parsed.data.customerId,
    staff_id: parsed.data.staffId,
    service_id: parsed.data.serviceId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "confirmed",
  });
  if (error) {
    logDbError("insert", error);
    return {
      error: error.code === "23503" ? REFERENCE_UNAVAILABLE : BOOKING_FAILED,
    };
  }

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
  if (fetchError) {
    logDbError("status read", fetchError);
    return { error: UPDATE_FAILED };
  }
  if (!current) return { error: NOT_FOUND };

  const allowed =
    APPOINTMENT_STATUS_TRANSITIONS[current.status as AppointmentStatus];
  if (!allowed.includes(parsed.data.status)) {
    return {
      error: `Can't move a ${current.status} appointment to ${parsed.data.status}.`,
    };
  }

  // Apply the transition only to the status it was validated against, so a
  // concurrent change between the read and the write — another user marking
  // it cancelled, or a cascade deleting it — cannot be overwritten. Zero rows
  // touched means the check no longer holds; it must not read as success.
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.appointmentId)
    .eq("status", current.status)
    .select("id")
    .maybeSingle();
  if (error) {
    logDbError("status update", error);
    return { error: UPDATE_FAILED };
  }
  if (!data) return { error: CHANGED };

  revalidatePath("/calendar");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  return {};
}
