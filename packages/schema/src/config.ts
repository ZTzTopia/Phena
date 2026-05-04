import z from "zod/v4";
import { ConfigKey } from "./enums";

export const ConfigKeySchema = z.enum(Object.values(ConfigKey));

export const ConfigModel = {
  configBody: z.object({
    value: z.string(),
  }),
  configParams: z.object({
    key: ConfigKeySchema,
  }),
  configResponse: z.object({
    key: ConfigKeySchema,
    value: z.string(),
  }),
  configListResponse: z.array(
    z.object({
      key: ConfigKeySchema,
      value: z.string(),
    }),
  ),
  flagPreviewRequest: z.object({
    template: z.string(),
  }),
  flagPreviewResponse: z.object({
    samples: z.array(
      z.object({
        context: z.object({
          round: z.number(),
          tick: z.number(),
          challengeId: z.number(),
          teamId: z.number(),
          serviceId: z.number(),
          index: z.number(),
        }),
        result: z.string(),
      }),
    ),
  }),
} as const;

export type ConfigModel = {
  [k in keyof typeof ConfigModel]: z.infer<(typeof ConfigModel)[k]>;
};
