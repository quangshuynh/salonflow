"use server";

import { revalidatePath } from "next/cache";

import { getBusinessId } from "@/lib/db/context";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import {
  customerSchema,
  type CustomerFormValues,
} from "@/lib/validations/customer";

export type ActionResult = { error?: string };

export async function createCustomer(
  values: CustomerFormValues
): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to save customers." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    business_id: await getBusinessId(),
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
  });
  if (error) return { error: error.message };

  revalidatePath("/customers");
  return {};
}
