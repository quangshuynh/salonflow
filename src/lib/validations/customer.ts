import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[\d\s()+-]+$/, "Phone can only contain digits and ( ) + -"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
