"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  businessProfileSchema,
  type BusinessProfileValues,
} from "@/lib/validations/settings";

type BusinessProfileFormProps = {
  defaultValues: BusinessProfileValues;
};

export function BusinessProfileForm({
  defaultValues,
}: BusinessProfileFormProps) {
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<BusinessProfileValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues,
  });

  function onSubmit(values: BusinessProfileValues) {
    // Mock-data stage: keep the values as the new form baseline.
    // Becomes a Supabase update in Sprint 4.
    reset(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>
            How your business appears to customers on bookings and receipts.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="business-name">Business name</FieldLabel>
              <Input
                id="business-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="business-email">Email</FieldLabel>
                <Input
                  id="business-email"
                  type="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="business-phone">Phone</FieldLabel>
                <Input
                  id="business-phone"
                  type="tel"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="business-address">Address</FieldLabel>
              <Input
                id="business-address"
                aria-invalid={!!errors.address}
                {...register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="mt-6 justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Check className="size-4" />
              Saved
            </span>
          )}
          <Button type="submit" disabled={!isDirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
