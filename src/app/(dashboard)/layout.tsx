import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader, type HeaderUser } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without Supabase credentials the app runs unauthenticated on mock data.
  let user: HeaderUser | null = null;

  if (getSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", authUser.id)
      .maybeSingle();
    if (!profile) redirect("/onboarding");

    user = {
      email: authUser.email ?? "",
      name: profile.full_name ?? authUser.email ?? "Account",
    };
  }

  // Mutations are unavailable without Supabase, so the UI says so up front
  // instead of surfacing it as an error after the user submits a form.
  const demoMode = !getSupabaseEnv();

  return (
    <SidebarProvider>
      <a
        href="#dashboard-content"
        className="sr-only rounded-lg bg-background px-3 py-2 text-sm font-medium ring-3 ring-ring/50 focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader user={user} demoMode={demoMode} />
        {/* SidebarInset is already the <main> landmark; this is its target. */}
        <div id="dashboard-content" className="flex flex-1 flex-col p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
