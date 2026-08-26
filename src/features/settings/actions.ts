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

/**
 * Unlike the CRUD actions this target is never client-supplied — it is the
 * caller's own business, resolved from their profile — so zero affected rows
 * is not a not-found. It means that business stopped being reachable between
 * resolving the profile and writing, which is a failed save.
 */
const SAVE_FAILED =
  "Couldn't save your business profile. Sign out and back in, then try again.";

export async function updateBusinessProfile(
  values: BusinessProfileValues
): Promise<ActionResult> {
  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to save settings." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
    })
    .eq("id", await getBusinessId())
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: SAVE_FAILED };

  revalidatePath("/settings");
  return {};
}
