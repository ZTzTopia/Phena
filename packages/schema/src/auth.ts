import z from "zod/v4";
import { RoleSchema } from "./types";

export const TeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: RoleSchema,
});

export type TeamResponse = z.infer<typeof TeamResponseSchema>;

export const AuthModel = {
  login: z.object({
    name: z.string().min(2),
    password: z.string().min(3),
    role: RoleSchema.optional(),
  }),
  register: z.object({
    name: z.string().min(2).max(100),
    password: z.string().min(8),
  }),
  loginResponse: z.object({
    team: TeamResponseSchema,
  }),
  registerResponse: z.object({
    team: TeamResponseSchema,
    token: z.string(),
  }),
  logoutResponse: z.object({
    message: z.string(),
  }),
  meResponse: z.object({
    team: TeamResponseSchema,
  }),
} as const;

export type AuthModel = {
  [k in keyof typeof AuthModel]: z.infer<(typeof AuthModel)[k]>;
};
