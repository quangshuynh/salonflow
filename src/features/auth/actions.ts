"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import {
  loginSchema,
  onboardingSchema,
  signupSchema,
  type LoginValues,
  type OnboardingValues,
  type SignupValues,
} from "@/lib/validations/auth";

export type AuthActionResult = {
  error?: string;
  /** Signup succeeded but email confirmation is required before sign-in. */
  confirmEmail?: boolean;
};

export async function signIn(values: LoginValues): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return { error: "Check your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile ? "/dashboard" : "/onboarding");
}

export async function signUp(values: SignupValues): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: error.message };

  // With email confirmation enabled there is no session yet; the business
  // gets created on first sign-in via the onboarding step instead.
  if (!data.session) return { confirmEmail: true };

  const { error: rpcError } = await supabase.rpc("create_business_with_owner", {
    business_name: parsed.data.businessName,
    owner_name: parsed.data.fullName,
  });
  if (rpcError) return { error: rpcError.message };

  redirect("/dashboard");
}

export async function completeOnboarding(
  values: OnboardingValues
): Promise<AuthActionResult> {
  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) return { error: "Check the form for errors." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_business_with_owner", {
    business_name: parsed.data.businessName,
    owner_name: parsed.data.fullName,
  });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
