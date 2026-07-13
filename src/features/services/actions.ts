"use server";

import { revalidatePath } from "next/cache";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/service";

export type ActionResult = { error?: string };

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
