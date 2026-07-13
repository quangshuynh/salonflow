"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/service";

export type ActionResult = { error?: string };

/** Postgres foreign-key violation — the service has appointment history. */
const FK_VIOLATION = "23503";

export async function createService(
  values: ServiceFormValues
): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to save services." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    business_id: await getBusinessId(),
    name: parsed.data.name,
    category: parsed.data.category,
    duration_min: parsed.data.durationMin,
    price_cents: Math.round(parsed.data.price * 100),
  });
  if (error) return { error: error.message };

  revalidatePath("/services");
  return {};
}

export async function updateService(
  id: string,
  values: ServiceFormValues
): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid service." };
  const parsed = serviceSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to edit services." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      category: parsed.data.category,
      duration_min: parsed.data.durationMin,
      price_cents: Math.round(parsed.data.price * 100),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/services");
  return {};
}

export async function deleteService(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid service." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to delete services." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) {
    if (error.code === FK_VIOLATION) {
      return {
        error:
          "This service has appointment history and can't be deleted. You can rename or reprice it instead.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/services");
  return {};
}
