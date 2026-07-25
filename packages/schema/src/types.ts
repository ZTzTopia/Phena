import { z } from "zod/v4";
import type { SSEEventType } from "./enums";

export const ROLES = ["admin", "team"] as const;
export const RoleSchema = z.enum(ROLES);
export type Role = z.infer<typeof RoleSchema>;

export const JWTPayloadSchema = z.object({
  id: z.string(),
  role: RoleSchema,
  iat: z.number(),
  exp: z.number(),
});
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export type SSEEvent<T = unknown> = {
  type: SSEEventType;
  data: T;
  timestamp: number;
};
