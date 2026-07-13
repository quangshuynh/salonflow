import { z } from "zod";

export const appointmentSchema = z
  .object({
    customerId: z.string({ error: "Select a customer" }).min(1, "Select a customer"),
    serviceId: z.string({ error: "Select a service" }).min(1, "Select a service"),
    staffId: z.string({ error: "Select a staff member" }).min(1, "Select a staff member"),
    date: z
      .string({ error: "Pick a date" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
    time: z
      .string({ error: "Pick a time" })
      .regex(/^\d{2}:\d{2}$/, "Pick a time"),
  })
  .refine(
    (values) => {
      // Let the field-level errors handle missing/malformed values.
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
        !/^\d{2}:\d{2}$/.test(values.time)
      ) {
        return true;
      }
      const startsAt = new Date(`${values.date}T${values.time}`);
      return startsAt.getTime() > Date.now();
    },
    { path: ["time"], error: "Appointment time must be in the future" }
  );

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
