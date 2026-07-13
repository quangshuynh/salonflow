import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getSupabaseEnv } from "@/lib/db/env";
import { createClient } from "@/lib/db/server";

export const metadata: Metadata = { title: "Set up your business" };

export default async function OnboardingPage() {
  if (!getSupabaseEnv()) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile) redirect("/dashboard");

  const defaultName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : undefined;

  return <OnboardingForm defaultName={defaultName} />;
}
