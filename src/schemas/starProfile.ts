import { z } from "zod";

export const starProfileUpdateSchema = z.object({
  starName: z
    .string()
    .min(3, "Star name must be at least 3 characters")
    .max(24, "Star name must be at most 24 characters")
    .regex(
      /^[a-z0-9_]+$/i,
      "Only letters, numbers, and underscores are allowed"
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters"),
  bio: z
    .string()
    .max(150, "Bio must be at most 150 characters")
    .optional()
    .or(z.literal("")),
  avatar: z.string().optional().or(z.literal("")),
});

export type StarProfileUpdate = z.infer<typeof starProfileUpdateSchema>;
