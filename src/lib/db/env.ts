/**
 * Reads the Supabase connection env vars. Supports the current
 * `sb_publishable_...` key naming with a fallback to the legacy anon key.
 * Returns null when unconfigured so callers can degrade gracefully.
 *
 * Full `process.env.NEXT_PUBLIC_*` references are required here — Next
 * inlines them statically into client bundles.
 */
export function getSupabaseEnv(): { url: string; key: string } | null {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function requireSupabaseEnv(): { url: string; key: string } {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  return env;
}
