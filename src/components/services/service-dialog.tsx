"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { createService, updateService } from "@/features/services/actions";
import { SERVICE_CATEGORY_LABELS } from "@/features/services/constants";
import {
  serviceSchema,
  type ServiceFormValues,
} from "@/lib/validations/service";
import type { Service } from "@/types";

type ServiceDialogProps = {
  /** When set, the dialog edits this service instead of creating one. */
  service?: Service;
  /** Controlled open state — used when opening from an external menu. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ServiceDialog({
  service,
  open: controlledOpen,
  onOpenChange,
}: ServiceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          category: service.category,
          durationMin: service.durationMin,
          price: service.price,
        }
      : { name: "" },
  });

  function onSubmit(values: ServiceFormValues) {
    startTransition(async () => {
      const result = service
        ? await updateService(service.id, values)
        : await createService(values);
      if (result.error) {
        setError("root", { message: result.error });
        return;
      }
      reset(service ? values : undefined);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger render={<Button />}>
          <Plus data-icon="inline-start" />
          Add service
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>
            {service
              ? "Update this service's details, duration, or price."
              : "Add a service to your menu with its duration and price."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="service-name">Name</FieldLabel>
              <Input
                id="service-name"
                placeholder="Gel Manicure"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="service-category">Category</FieldLabel>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    items={SERVICE_CATEGORY_LABELS}
                    value={field.value ?? null}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="service-category"
                      className="w-full"
                      aria-invalid={!!errors.category}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SERVICE_CATEGORY_LABELS).map(
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
              <FieldError errors={[errors.category]} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="service-duration">
                  Duration (min)
                </FieldLabel>
                <Input
                  id="service-duration"
                  type="number"
                  min={5}
                  step={5}
                  placeholder="45"
                  aria-invalid={!!errors.durationMin}
                  {...register("durationMin", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.durationMin]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="service-price">Price ($)</FieldLabel>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step={5}
                  placeholder="50"
                  aria-invalid={!!errors.price}
                  {...register("price", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.price]} />
              </Field>
            </div>
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
              {pending ? "Saving..." : service ? "Save changes" : "Add service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
