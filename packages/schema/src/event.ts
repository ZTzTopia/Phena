import z from "zod/v4";

export const EventModel = {
  publishBody: z.object({
    message: z.string().min(1),
    teamId: z.string().optional(),
  }),
} as const;

export type EventModel = {
  [k in keyof typeof EventModel]: z.infer<(typeof EventModel)[k]>;
};

export type SSEEventType =
  | "notification"
  | "activity"
  | "scoreboard"
  | "tick"
  | "service_status"
  | "config_change"
  | "log"
  | "ping"
  | "connected";

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}
