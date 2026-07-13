"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/features/auth/actions";
import {
  onboardingSchema,
  type OnboardingValues,
} from "@/lib/validations/auth";

export function OnboardingForm({ defaultName }: { defaultName?: string }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { fullName: defaultName ?? "", businessName: "" },
  });

  function onSubmit(values: OnboardingValues) {
    startTransition(async () => {
      const result = await completeOnboarding(values);
      if (result?.error) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up your business</CardTitle>
        <CardDescription>
          One last step — tell us about your salon.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="onboarding-name">Your name</FieldLabel>
              <Input
                id="onboarding-name"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="onboarding-business">
                Business name
              </FieldLabel>
              <Input
                id="onboarding-business"
                placeholder="Glow & Co. Beauty Studio"
                aria-invalid={!!errors.businessName}
                {...register("businessName")}
              />
              <FieldError errors={[errors.businessName]} />
            </Field>
            {errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Setting up..." : "Finish setup"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
