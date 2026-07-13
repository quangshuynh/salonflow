"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus } from "lucide-react";
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
import {
  appointmentSchema,
  type AppointmentFormValues,
} from "@/lib/validations/appointment";
import type { Customer, Service, StaffMember } from "@/types";

type SelectFieldProps = {
  id: string;
  placeholder: string;
  items: Record<string, string>;
  value: string | undefined;
  invalid: boolean;
  onChange: (value: string | null) => void;
};

function SelectField({
  id,
  placeholder,
  items,
  value,
  invalid,
  onChange,
}: SelectFieldProps) {
  return (
    <Select items={items} value={value ?? null} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type NewAppointmentDialogProps = {
  customers: Customer[];
  services: Service[];
  staff: StaffMember[];
  defaultDate: Date;
  onCreate: (values: AppointmentFormValues) => void;
};

export function NewAppointmentDialog({
  customers,
  services,
  staff,
  defaultDate,
  onCreate,
}: NewAppointmentDialogProps) {
  const [open, setOpen] = useState(false);

  const customerItems = useMemo(
    () => Object.fromEntries(customers.map((c) => [c.id, c.name])),
    [customers]
  );
  const serviceItems = useMemo(
    () =>
      Object.fromEntries(
        services.map((s) => [s.id, `${s.name} (${s.durationMin} min)`])
      ),
    [services]
  );
  const staffItems = useMemo(
    () => Object.fromEntries(staff.map((s) => [s.id, s.name])),
    [staff]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { date: toDateInputValue(defaultDate), time: "" },
  });

  function onSubmit(values: AppointmentFormValues) {
    onCreate(values);
    reset({ date: values.date, time: "" });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <CalendarPlus data-icon="inline-start" />
        New appointment
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>
            Book a service for a customer with a staff member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="appointment-customer">Customer</FieldLabel>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <SelectField
                    id="appointment-customer"
                    placeholder="Select a customer"
                    items={customerItems}
                    value={field.value}
                    invalid={!!errors.customerId}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.customerId]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="appointment-service">Service</FieldLabel>
              <Controller
                control={control}
                name="serviceId"
                render={({ field }) => (
                  <SelectField
                    id="appointment-service"
                    placeholder="Select a service"
                    items={serviceItems}
                    value={field.value}
                    invalid={!!errors.serviceId}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.serviceId]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="appointment-staff">Staff</FieldLabel>
              <Controller
                control={control}
                name="staffId"
                render={({ field }) => (
                  <SelectField
                    id="appointment-staff"
                    placeholder="Select a staff member"
                    items={staffItems}
                    value={field.value}
                    invalid={!!errors.staffId}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError errors={[errors.staffId]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="appointment-date">Date</FieldLabel>
                <Input
                  id="appointment-date"
                  type="date"
                  aria-invalid={!!errors.date}
                  {...register("date")}
                />
                <FieldError errors={[errors.date]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="appointment-time">Time</FieldLabel>
                <Input
                  id="appointment-time"
                  type="time"
                  min="08:00"
                  max="18:45"
                  step={900}
                  aria-invalid={!!errors.time}
                  {...register("time")}
                />
                <FieldError errors={[errors.time]} />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Book appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
