import z from "zod/v4";
import { ConfigKey } from "./enums";

export const ConfigValueSchemas = {
  [ConfigKey.ContestName]: z.string(),
  [ConfigKey.TickDuration]: z.coerce.number().int(),
  [ConfigKey.IsRunning]: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true"),
  [ConfigKey.CurrentTick]: z.coerce.number().int(),
  [ConfigKey.CurrentRound]: z.coerce.number().int(),
  [ConfigKey.StartDate]: z.string(),
  [ConfigKey.TickPerRound]: z.coerce.number().int(),
  [ConfigKey.TotalRounds]: z.coerce.number().int(),
  [ConfigKey.AttackPoints]: z.coerce.number().int(),
  [ConfigKey.DefensePoints]: z.coerce.number().int(),
  [ConfigKey.SlaWeight]: z.coerce.number(),
  [ConfigKey.FirstBloodBonus]: z.coerce.number().int().nullable(),
  [ConfigKey.CheckerPoolSize]: z.coerce.number().int(),
  [ConfigKey.CheckerTimeout]: z.coerce.number().int(),
  [ConfigKey.FlagTemplate]: z.string(),
} as const satisfies Record<ConfigKey, z.ZodType>;

export interface ConfigValueTypes {
  [ConfigKey.ContestName]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.ContestName]>;
  [ConfigKey.TickDuration]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.TickDuration]>;
  [ConfigKey.IsRunning]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.IsRunning]>;
  [ConfigKey.CurrentTick]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.CurrentTick]>;
  [ConfigKey.CurrentRound]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.CurrentRound]>;
  [ConfigKey.StartDate]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.StartDate]>;
  [ConfigKey.TickPerRound]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.TickPerRound]>;
  [ConfigKey.TotalRounds]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.TotalRounds]>;

  [ConfigKey.AttackPoints]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.AttackPoints]>;
  [ConfigKey.DefensePoints]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.DefensePoints]>;
  [ConfigKey.SlaWeight]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.SlaWeight]>;
  [ConfigKey.FirstBloodBonus]: z.infer<
    (typeof ConfigValueSchemas)[typeof ConfigKey.FirstBloodBonus]
  >;
  [ConfigKey.CheckerPoolSize]: z.infer<
    (typeof ConfigValueSchemas)[typeof ConfigKey.CheckerPoolSize]
  >;
  [ConfigKey.CheckerTimeout]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.CheckerTimeout]>;
  [ConfigKey.FlagTemplate]: z.infer<(typeof ConfigValueSchemas)[typeof ConfigKey.FlagTemplate]>;
}

export const ConfigKeySchema = z.nativeEnum(ConfigKey);

export const ConfigModel = {
  configBody: z.object({
    value: z.string().or(z.number()).or(z.boolean()),
  }),
  configParams: z.object({
    key: ConfigKeySchema,
  }),
  configResponse: z.object({
    key: ConfigKeySchema,
    value: z.string().or(z.number()).or(z.boolean()).or(z.null()),
  }),
  configListResponse: z.array(
    z.object({
      key: ConfigKeySchema,
      value: z.string().or(z.number()).or(z.boolean()).or(z.null()),
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
  contestSection: z.object({
    name: z.string().min(1),
    tickDuration: z.number().int().min(30).max(600),
    tickPerRound: z.number().int().min(1).max(64),
    totalRounds: z.number().int().min(1).max(256),
    startDate: z.string(),
  }),
  scoringSection: z.object({
    attackPoints: z.number().int().min(1),
    defensePoints: z.number().int().min(1),
    slaWeight: z.number().min(0).max(1),
    firstBloodBonus: z.number().int().min(0).nullable(),
  }),
  systemSection: z.object({
    checkerPoolSize: z.number().int().min(1).max(100),
    checkerTimeout: z.number().int().min(5).max(300),
    flagTemplate: z.string(),
  }),
} as const;

export type ConfigModel = {
  [k in keyof typeof ConfigModel]: z.infer<(typeof ConfigModel)[k]>;
};
