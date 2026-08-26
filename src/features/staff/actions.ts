"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import { staffSchema, type StaffFormValues } from "@/lib/validations/staff";

export type ActionResult = { error?: string };

/** Routes that render staff names or staff-linked appointments. */
const STAFF_ROUTES = ["/staff", "/calendar", "/appointments", "/dashboard", "/reports"];

/**
 * RLS filters an invisible row out of an UPDATE or DELETE without raising, so
 * a mutation aimed at another tenant reports zero rows rather than an error.
 * Deliberately ambiguous: it must not reveal whether the row exists elsewhere.
 */
const NOT_FOUND = "That staff member no longer exists, or isn't yours to change.";

export async function createStaff(
  values: StaffFormValues
): Promise<ActionResult> {
  const parsed = staffSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to save staff." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("staff").insert({
    business_id: await getBusinessId(),
    name: parsed.data.name,
    role: parsed.data.role,
  });
  if (error) return { error: error.message };

  revalidatePath("/staff");
  return {};
}

export async function updateStaff(
  id: string,
  values: StaffFormValues
): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid staff member." };
  const parsed = staffSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to edit staff." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .update({ name: parsed.data.name, role: parsed.data.role })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: NOT_FOUND };

  STAFF_ROUTES.forEach((route) => revalidatePath(route));
  return {};
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid staff member." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to delete staff." };
  }

  const supabase = await createClient();
  // Cascades: the staff member's appointments are deleted with them.
  const { data, error } = await supabase
    .from("staff")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: NOT_FOUND };

  STAFF_ROUTES.forEach((route) => revalidatePath(route));
  return {};
}
