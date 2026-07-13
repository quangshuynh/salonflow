"use server";

import { revalidatePath } from "next/cache";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import { staffSchema, type StaffFormValues } from "@/lib/validations/staff";

export type ActionResult = { error?: string };

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
