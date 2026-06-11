import type { NewFlag } from "@api/db/schema/flags";
import { evaluateTemplate, type FlagContext } from "@api/lib/flag-expression";
import { FlagRepository } from "@api/repositories/flags";
import { ServiceRepository } from "@api/repositories/services";
import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { ConfigService } from "./config";

export class FlagGenerationService extends Effect.Service<FlagGenerationService>()(
  "FlagGenerationService",
  {
    effect: Effect.gen(function* () {
      const generateFlagsForTick = (round: number, tick: number) =>
        Effect.gen(function* () {
          const template = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.FlagTemplate));
          const allServices = yield* ServiceRepository.findAllWithChallengeDetail();

          const flagsToCreate: NewFlag[] = [];

          for (const service of allServices) {
            if (!service.challenge) {
              continue;
            }

            if (service.challenge.releaseRound > round) {
              continue;
            }

            const numFlags = service.challenge.numFlags;
            for (let index = 0; index < numFlags; index++) {
              const ctx: FlagContext = {
                challengeId: service.challengeId,
                teamId: service.teamId,
                serviceId: service.id,
                round,
                tick,
                index,
              };
              const value = evaluateTemplate(template, ctx);

              if (value instanceof Error) {
                yield* Effect.logError(
                  `Flag generation failed for service ${service.id}: ${value.message}`,
                );
                continue;
              }

              flagsToCreate.push({ serviceId: service.id, round, tick, index, value });
            }
          }

          if (flagsToCreate.length > 0) {
            yield* FlagRepository.createBatch(flagsToCreate);
            yield* Effect.logDebug(
              `Generated ${flagsToCreate.length} flags for round ${round} tick ${tick}`,
            );
          }
        });

      yield* Effect.succeed(null);

      return { generateFlagsForTick };
    }),
  },
) {}
