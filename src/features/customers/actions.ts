"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

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

export async function updateCustomer(
  id: string,
  values: CustomerFormValues
): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid customer." };
  const parsed = customerSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to edit customers." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return {};
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) return { error: "Invalid customer." };
  if (!getSupabaseEnv()) {
    return { error: "Demo mode — connect Supabase to delete customers." };
  }

  const supabase = await createClient();
  // Cascades: the customer's appointments are deleted with them.
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/customers");
  revalidatePath("/appointments");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/customers");
}
