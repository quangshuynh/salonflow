import "server-only";

import { createClient } from "@/lib/db/server";

/**
 * The business the signed-in user belongs to. RLS restricts `profiles`
 * to the caller's own row, so no explicit user filter is needed.
 * Inserts must carry this id — RLS `with check` rejects anything else.
 */
export async function getBusinessId(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("business_id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No business profile for the current user");
  return data.business_id;
}
