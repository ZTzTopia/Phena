import { DEFAULT_FLAG_TEMPLATE } from "@api/lib/flag-expression";
import { ConfigKey, ConfigValueSchemas, type ConfigValueTypes } from "@phena/schema";
import { Effect } from "effect";
import { ConfigValidationError } from "../lib/errors";
import { ConfigRepository } from "../repositories/config";

const defaults: ConfigValueTypes = {
  [ConfigKey.ContestName]: "Phena CTF",
  [ConfigKey.TickDuration]: 60,
  [ConfigKey.IsRunning]: false,
  [ConfigKey.CurrentTick]: 1,
  [ConfigKey.CurrentRound]: 1,
  [ConfigKey.StartDate]: new Date().toISOString(),
  [ConfigKey.TickPerRound]: 5,
  [ConfigKey.TotalRounds]: 10,
  [ConfigKey.EndDate]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  [ConfigKey.AttackPoints]: 100,
  [ConfigKey.DefensePoints]: 50,
  [ConfigKey.SlaWeight]: 0.3,
  [ConfigKey.FirstBloodBonus]: null,
  [ConfigKey.CheckerPoolSize]: 10,
  [ConfigKey.CheckerTimeout]: 30,
  [ConfigKey.FlagTemplate]: DEFAULT_FLAG_TEMPLATE,
};

const parseConfig = <K extends ConfigKey>(key: K, raw: string) => {
  const r = ConfigValueSchemas[key].safeParse(raw);
  if (!r.success) {
    return Effect.fail(new ConfigValidationError({ message: `Invalid value for ${key}: ${raw}` }));
  }
  return Effect.succeed(r.data as ConfigValueTypes[K]);
};

const dbTypeOf = (v: string | number | boolean) =>
  typeof v === "boolean" ? "boolean" : typeof v === "number" ? "number" : "string";

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Effect.gen(function* () {
    const getConfig = <K extends ConfigKey>(key: K) =>
      Effect.gen(function* () {
        const raw = yield* ConfigRepository.get(key);
        return raw === null ? defaults[key] : yield* parseConfig(key, raw);
      });

    const getAllConfig = () =>
      Effect.gen(function* () {
        const stored = yield* ConfigRepository.getAll();
        const result: ConfigValueTypes = { ...defaults };
        const keys = Object.values(ConfigKey) as ConfigKey[];
        for (const key of keys) {
          const raw = stored[key];
          if (raw === undefined) continue;
          const value = yield* parseConfig(key, raw);
          Object.assign(result, { [key]: value });
        }
        return result;
      });

    const setConfig = <K extends ConfigKey>(key: K, value: ConfigValueTypes[K]) =>
      Effect.gen(function* () {
        if (value === null || value === undefined) return;
        return yield* ConfigRepository.set(key, String(value), dbTypeOf(value));
      });

    yield* Effect.succeed(null);

    return { getConfig, getAllConfig, setConfig };
  }),
}) {}
