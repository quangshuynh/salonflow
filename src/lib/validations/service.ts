import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum(["hair", "nails", "spa", "lashes", "barber"], {
    error: "Select a category",
  }),
  durationMin: z
    .number({ error: "Enter a duration in minutes" })
    .int("Duration must be a whole number of minutes")
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration can't exceed 8 hours"),
  price: z
    .number({ error: "Enter a price" })
    .min(0, "Price can't be negative")
    .max(10000, "Price seems too high"),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
