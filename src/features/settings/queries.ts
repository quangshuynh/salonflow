import "server-only";

import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";
import { MOCK_BUSINESS } from "@/lib/mock-data";
import type { BusinessProfileValues } from "@/lib/validations/settings";

export async function getBusinessProfile(): Promise<BusinessProfileValues> {
  if (!getSupabaseEnv()) return MOCK_BUSINESS;

  const supabase = await createClient();
  // RLS scopes businesses to the caller's own business, so no id filter.
  const { data, error } = await supabase
    .from("businesses")
    .select("name, email, phone, address")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No business found for the current user");

  return {
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
  };
}
