import type { SSEEventType } from "./enums";

export type Role = "admin" | "team";

export type JWTPayload = {
  id: string;
  role: Role;
  iat: number;
  exp: number;
};

export type SSEEvent<T = unknown> = {
  type: SSEEventType;
  data: T;
  timestamp: number;
};
