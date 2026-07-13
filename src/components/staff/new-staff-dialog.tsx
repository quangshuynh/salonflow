"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStaff } from "@/features/staff/actions";
import { STAFF_ROLE_LABELS } from "@/features/staff/constants";
import { staffSchema, type StaffFormValues } from "@/lib/validations/staff";

export function NewStaffDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: StaffFormValues) {
    startTransition(async () => {
      const result = await createStaff(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus data-icon="inline-start" />
        Add staff member
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
          <DialogDescription>
            Add a team member so you can assign them appointments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="staff-name">Name</FieldLabel>
              <Input
                id="staff-name"
                placeholder="Mai Tran"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="staff-role">Role</FieldLabel>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    items={STAFF_ROLE_LABELS}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="staff-role"
                      className="w-full"
                      aria-invalid={!!errors.role}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STAFF_ROLE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.role]} />
            </Field>
            {errors.root && (
              <p role="alert" className="text-sm text-destructive">
                {errors.root.message}
              </p>
            )}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding..." : "Add staff member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
