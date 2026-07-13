import { createBrowserClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/db/env";

/** Supabase client for Client Components. */
export function createClient() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient(url, key);
}
