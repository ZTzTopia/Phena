import z from "zod/v4";
import { PaginationMetaSchema } from "./common";

export const SystemLogSchema = z.object({
  id: z.number().int(),
  type: z.enum(["info", "success", "error"]),
  message: z.string(),
  round: z.number().int().nullable(),
  tick: z.number().int().nullable(),
  createdAt: z
    .string()
    .or(z.date())
    .transform((d) => (d instanceof Date ? d.toISOString() : d)),
  team: z
    .object({
      publicId: z.string(),
      name: z.string(),
    })
    .nullable(),
});

export type SystemLog = z.infer<typeof SystemLogSchema>;

export const SystemLogModel = {
  logsListResponse: z.object({
    logs: z.array(SystemLogSchema),
    pagination: PaginationMetaSchema,
  }),
} as const;

export type SystemLogModel = {
  [k in keyof typeof SystemLogModel]: z.infer<(typeof SystemLogModel)[k]>;
};
