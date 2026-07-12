"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  customerSchema,
  type CustomerFormValues,
} from "@/lib/validations/customer";

type NewCustomerDialogProps = {
  onCreate: (values: CustomerFormValues) => void;
};

export function NewCustomerDialog({ onCreate }: NewCustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  function onSubmit(values: CustomerFormValues) {
    onCreate(values);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus data-icon="inline-start" />
        New customer
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New customer</DialogTitle>
          <DialogDescription>
            Add a customer to your directory. You can book their first
            appointment afterwards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>
              <Input
                id="customer-name"
                placeholder="Emily Chen"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>
              <Input
                id="customer-email"
                type="email"
                placeholder="emily@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="(555) 123-4567"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              <FieldError errors={[errors.phone]} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Add customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
