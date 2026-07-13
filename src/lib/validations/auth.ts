import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  businessName: z.string().min(2, "Enter your business name"),
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const onboardingSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  businessName: z.string().min(2, "Enter your business name"),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
