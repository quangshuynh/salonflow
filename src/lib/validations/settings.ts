import { z } from "zod";

export const businessProfileSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[\d\s()+-]+$/, "Phone can only contain digits and ( ) + -"),
  address: z.string().min(5, "Enter the business address"),
});

export type BusinessProfileValues = z.infer<typeof businessProfileSchema>;
