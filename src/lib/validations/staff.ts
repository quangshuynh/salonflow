import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["stylist", "barber", "nail-tech", "esthetician", "manager"], {
    error: "Select a role",
  }),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
