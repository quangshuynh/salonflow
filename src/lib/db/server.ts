import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { requireSupabaseEnv } from "@/lib/db/env";

/**
 * Supabase client for Server Components, Server Actions, and Route
 * Handlers. Creates a fresh client per request — never cache it in a
 * module-level variable, or requests will leak each other's sessions.
 */
export async function createClient() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the proxy refreshes sessions before render.
        }
      },
    },
  });
}
