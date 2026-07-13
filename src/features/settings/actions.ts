"use server";

import { revalidatePath } from "next/cache";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  businessProfileSchema,
  type BusinessProfileValues,
} from "@/lib/validations/settings";

export type ActionResult = { error?: string };

export async function updateBusinessProfile(
  values: BusinessProfileValues
): Promise<ActionResult> {
  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to save settings." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
    })
    .eq("id", await getBusinessId());
  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}
