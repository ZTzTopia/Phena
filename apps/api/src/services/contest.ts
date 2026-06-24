import { checkerResults } from "@api/db/schema/checker-results";
import { flags } from "@api/db/schema/flags";
import { scoresPerTick } from "@api/db/schema/scores";
import { serviceOperations } from "@api/db/schema/service-operations";
import { serviceScoresPerTick } from "@api/db/schema/service-scores";
import { services as servicesTable } from "@api/db/schema/services";
import { submissions } from "@api/db/schema/submissions";
import { systemLogs } from "@api/db/schema/system-logs";
import { ConfigKey } from "@phena/schema";
import { isNull, sql } from "drizzle-orm";
import { Effect, Fiber } from "effect";
import { Db } from "../db";
import { ConfigService } from "./config";
import { FlagGenerationService } from "./flag-generation";
import { ScoreService } from "./score";

const globalSchedulerRef = globalThis as typeof globalThis & {
  __phenaSchedulerFiber: Fiber.RuntimeFiber<void, Error> | null;
  __phenaScheduledStartFiber: Fiber.RuntimeFiber<void, Error> | null;
};

export class ContestService extends Effect.Service<ContestService>()("ContestService", {
  effect: Effect.gen(function* () {
    const startScheduler = () =>
      Effect.gen(function* () {
        if (globalSchedulerRef.__phenaSchedulerFiber) {
          return;
        }

        const tickDuration = yield* ConfigService.use((svc) =>
          svc.getConfig(ConfigKey.TickDuration),
        );

        yield* Effect.logDebug(`Starting scheduler with tick duration: ${tickDuration}`);
        const fiber = yield* Effect.forkDaemon(tickScheduler(tickDuration));
        globalSchedulerRef.__phenaSchedulerFiber = fiber;
      });

    const stopScheduler = () =>
      Effect.gen(function* () {
        if (globalSchedulerRef.__phenaSchedulerFiber) {
          yield* Fiber.interrupt(globalSchedulerRef.__phenaSchedulerFiber);
          globalSchedulerRef.__phenaSchedulerFiber = null;
        }
      });

    const startContest = () =>
      Effect.gen(function* () {
        const isRunning = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (isRunning) {
          yield* Effect.fail(new Error("Contest is already running"));
          return;
        }

        yield* Effect.logDebug("Starting contest");
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, true));
        yield* startScheduler();
      });

    const scheduleStartIfNeeded = () =>
      Effect.gen(function* () {
        const startDateStr = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.StartDate));
        const startDate = new Date(startDateStr);
        const now = new Date();
        const delayMs = startDate.getTime() - now.getTime();

        if (delayMs <= 0) {
          const isRunning = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
          if (!isRunning) {
            return;
          }

          yield* startScheduler();
          return;
        }

        if (globalSchedulerRef.__phenaScheduledStartFiber) {
          yield* Fiber.interrupt(globalSchedulerRef.__phenaScheduledStartFiber);
        }

        const sleepEffect = Effect.sleep(`${delayMs} millis`).pipe(
          Effect.flatMap(() => startScheduler()),
        );
        const fiber = yield* Effect.forkDaemon(sleepEffect);
        globalSchedulerRef.__phenaScheduledStartFiber = fiber;
      });

    const reloadSchedule = () =>
      Effect.gen(function* () {
        if (globalSchedulerRef.__phenaScheduledStartFiber) {
          yield* Fiber.interrupt(globalSchedulerRef.__phenaScheduledStartFiber);
          globalSchedulerRef.__phenaScheduledStartFiber = null;
        }

        yield* scheduleStartIfNeeded();
      });

    const stopContest = () =>
      Effect.gen(function* () {
        const isRunning = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (!isRunning) {
          yield* Effect.fail(new Error("Contest is not running"));
          return;
        }

        yield* Effect.logDebug("Stopping contest");
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, false));
        yield* stopScheduler();
      });

    const tickScheduler = (tickDurationSeconds: number) =>
      Effect.gen(function* () {
        const initialRound = yield* ConfigService.use((svc) =>
          svc.getConfig(ConfigKey.CurrentRound),
        );
        const initialTick = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.CurrentTick));

        yield* Effect.logDebug(`Scheduler starting at round ${initialRound} tick ${initialTick}`);

        // TODO: Check if initial flags need to be generated
        if (initialRound === 1 && initialTick === 1) {
          yield* Effect.logDebug("Generating initial flags for round 1 tick 1");
          yield* FlagGenerationService.use((svc) =>
            svc.generateFlagsForTick(initialRound, initialTick),
          );
        }

        while (true) {
          yield* Effect.sleep(`${tickDurationSeconds} seconds`);

          const currentTick = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.CurrentTick),
          );
          const tickPerRound = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.TickPerRound),
          );
          const currentRound = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.CurrentRound),
          );
          const totalRounds = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.TotalRounds),
          );

          // This will calculate scores for every round and sla for every tick, but the flag
          // stolen and flag defended is real time right?

          const newTick = currentTick + 1;
          if (newTick > tickPerRound) {
            yield* ScoreService.use((svc) => svc.computeRoundScores(currentRound));

            const newRound = currentRound + 1;
            if (newRound > totalRounds) {
              yield* Effect.logDebug(
                `Contest ended: reached round ${newRound} past total ${totalRounds}`,
              );
              yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentRound, totalRounds));
              yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, tickPerRound));
              yield* stopContest();
              globalSchedulerRef.__phenaSchedulerFiber = null;
              return;
            }

            yield* Effect.logDebug(
              `Advancing to round ${newRound} tick 1 (was round ${currentRound} tick ${currentTick})`,
            );
            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentRound, newRound));
            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, 1));
            yield* FlagGenerationService.use((svc) => svc.generateFlagsForTick(newRound, 1));
          } else {
            yield* ScoreService.use((svc) => svc.computeSlaForTick(currentRound, currentTick));
            yield* Effect.logDebug(`Advancing to tick ${newTick} (round ${currentRound})`);
            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, newTick));
          }
        }
      });

    const resetContest = () =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Resetting contest");
        yield* stopScheduler();

        if (globalSchedulerRef.__phenaScheduledStartFiber) {
          yield* Fiber.interrupt(globalSchedulerRef.__phenaScheduledStartFiber);
          globalSchedulerRef.__phenaScheduledStartFiber = null;
        }

        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, false));
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, 1));
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentRound, 1));

        const gameTables = [
          checkerResults,
          flags,
          scoresPerTick,
          serviceOperations,
          serviceScoresPerTick,
          servicesTable,
          submissions,
          systemLogs,
        ] as const;

        yield* Effect.all(
          gameTables.map((table) =>
            Effect.flatMap(Db, (env) =>
              Effect.tryPromise({
                try: () =>
                  env.db
                    .update(table)
                    .set({ deletedAt: sql`now()` })
                    .where(isNull(table.deletedAt)),
                catch: (e) => new Error(String(e)),
              }),
            ),
          ),
        );
      });

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        Effect.runSync(
          Effect.gen(function* () {
            if (globalSchedulerRef.__phenaSchedulerFiber) {
              yield* Fiber.interrupt(globalSchedulerRef.__phenaSchedulerFiber);
              globalSchedulerRef.__phenaSchedulerFiber = null;
            }
            if (globalSchedulerRef.__phenaScheduledStartFiber) {
              yield* Fiber.interrupt(globalSchedulerRef.__phenaScheduledStartFiber);
              globalSchedulerRef.__phenaScheduledStartFiber = null;
            }
          }),
        );
      });
    }

    yield* Effect.succeed(null);

    return {
      startContest,
      stopContest,
      resetContest,
      scheduleStartIfNeeded,
      reloadSchedule,
    };
  }),
}) {}
