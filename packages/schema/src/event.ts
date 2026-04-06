import z from "zod/v4";
import { SSEEventType } from "./enums";

export const EventTypeSchema = z.enum(Object.values(SSEEventType));

export const SSEEventSchema = z.object({
  type: EventTypeSchema,
  data: z.unknown(),
  timestamp: z.number(),
});

export const EventModel = {
  publishBody: z.object({
    type: EventTypeSchema,
    data: z.string().min(1),
    teamId: z.string().optional(),
  }),
} as const;

export type EventModel = {
  [k in keyof typeof EventModel]: z.infer<(typeof EventModel)[k]>;
};
