import { z } from "zod";
export const profileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    currentPassword: z.string().optional(),
    password: z.string().min(8).max(100).optional(),
  }),
});
export const avatarSchema = z.object({
  body: z.object({
    avatar: z.string().url().or(z.literal("")),
  }),
});
