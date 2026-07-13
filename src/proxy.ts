import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/db/env";

/** URL prefixes that belong to the (dashboard) group and require a session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/calendar",
  "/appointments",
  "/customers",
  "/staff",
  "/services",
  "/reports",
  "/settings",
  "/onboarding",
];

const AUTH_PAGES = ["/login", "/signup"];

function startsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Refreshes the Supabase auth session on every request and enforces
 * auth-based redirects (Next 16 renamed `middleware` to `proxy`).
 * Server Components can't write cookies, so expired sessions must be
 * refreshed here, before rendering.
 *
 * Without Supabase credentials in .env.local this is a no-op, so the
 * mock-data app keeps working with zero environment setup.
 */
export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && startsWithAny(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && startsWithAny(pathname, AUTH_PAGES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Skip static assets and images; run everywhere else.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
