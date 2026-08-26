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

/**
 * RLS does not raise on rows the caller cannot see — it removes them from the
 * statement's scope, so a cross-tenant update or delete reports success while
 * changing nothing. Every mutation therefore returns the affected row and
 * treats an empty result as a miss, which is what the caller actually needs
 * to know. The tenant boundary itself is enforced in PostgreSQL, not here.
 */
const NOT_FOUND = "That customer no longer exists, or isn't yours to change.";

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
  const { data, error } = await supabase
    .from("customers")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: NOT_FOUND };

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
  // Cascades: the customer's appointments are deleted with them. Migration
  // 0003 scopes that cascade to the owning business.
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: NOT_FOUND };

  revalidatePath("/customers");
  revalidatePath("/appointments");
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  redirect("/customers");
}
