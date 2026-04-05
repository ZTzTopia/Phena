import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { ConfigRepository } from "../repositories/config";

const configDefaults: Record<string, unknown> = {
  [ConfigKey.ContestName]: "Phena CTF",
  [ConfigKey.TickDuration]: 60,
  [ConfigKey.IsRunning]: false,
  [ConfigKey.CurrentTick]: 1,
  [ConfigKey.CurrentRound]: 1,
  [ConfigKey.StartDate]: new Date().toISOString(),
  [ConfigKey.TickPerRound]: 5,
  [ConfigKey.TotalRounds]: 10,
  [ConfigKey.FlagTemplate]: "flag{...}",
};

export class ConfigService extends Effect.Service<ConfigService>()("ConfigService", {
  effect: Effect.gen(function* () {
    const getConfig = (key: ConfigKey) =>
      Effect.map(ConfigRepository.get(key), (value) => value ?? configDefaults[key]);

    const getAllConfig = () =>
      Effect.map(ConfigRepository.getAll(), (stored) => ({
        ...configDefaults,
        ...stored,
      }));

    const setConfig = (key: ConfigKey, value: unknown) =>
      ConfigRepository.set(key, String(value), "string");

    yield* Effect.succeed(null);

    return {
      getConfig,
      getAllConfig,
      setConfig,
    };
  }),
}) {}
