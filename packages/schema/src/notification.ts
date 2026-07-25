import { z } from "zod/v4";

export const NotificationSchema = z.object({
  id: z.number(),
  teamId: z.number().nullable(),
  message: z.string().max(512),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
});

export const NotificationModel = {
  createBody: z.object({
    message: z.string().min(1).max(512),
    teamPublicId: z.string().optional(),
  }),
  listResponse: z.object({
    notifications: z.array(NotificationSchema),
  }),
} as const;

export type NotificationModel = {
  [k in keyof typeof NotificationModel]: z.infer<(typeof NotificationModel)[k]>;
};
