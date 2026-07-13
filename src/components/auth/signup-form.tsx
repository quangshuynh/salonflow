"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
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
import { signUp } from "@/features/auth/actions";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";

export function SignupForm() {
  const [pending, startTransition] = useTransition();
  const [confirmEmail, setConfirmEmail] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", businessName: "", email: "", password: "" },
  });

  function onSubmit(values: SignupValues) {
    startTransition(async () => {
      const result = await signUp(values);
      if (result?.error) {
        setError("root", { message: result.error });
      } else if (result?.confirmEmail) {
        setConfirmEmail(true);
      }
    });
  }

  if (confirmEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="size-5 text-primary" />
            Check your email
          </CardTitle>
          <CardDescription>
            We sent you a confirmation link. After confirming, sign in and
            we&apos;ll finish setting up your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Go to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start your 14-day free trial. No card required.
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="signup-name">Your name</FieldLabel>
              <Input
                id="signup-name"
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              <FieldError errors={[errors.fullName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-business">Business name</FieldLabel>
              <Input
                id="signup-business"
                placeholder="Glow & Co. Beauty Studio"
                aria-invalid={!!errors.businessName}
                {...register("businessName")}
              />
              <FieldError errors={[errors.businessName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">Email</FieldLabel>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            {errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating account..." : "Create account"}
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
