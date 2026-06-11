import { ConfigKey } from "@phena/schema";
import { Effect, Fiber } from "effect";
import { ConfigService } from "./config";
import { FlagGenerationService } from "./flag-generation";

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

        const isRunning = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (!isRunning) {
          return;
        }

        const tickDuration = yield* ConfigService.use((svc) =>
          svc.getConfig(ConfigKey.TickDuration),
        );

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

        yield* startScheduler();
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, true));
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

        yield* stopScheduler();
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, false));
      });

    const tickScheduler = (tickDurationSeconds: number) =>
      Effect.gen(function* () {
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

          const newTick = currentTick + 1;
          if (newTick > tickPerRound) {
            const newRound = currentRound + 1;
            if (newRound > totalRounds) {
              yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentRound, newRound));
              yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, newTick));
              yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, false));
              globalSchedulerRef.__phenaSchedulerFiber = null;
              return;
            }

            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentRound, newRound));
            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, 1));
            yield* FlagGenerationService.use((svc) => svc.generateFlagsForTick(newRound, 1));
          } else {
            yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.CurrentTick, newTick));
          }
        }
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
      scheduleStartIfNeeded,
      reloadSchedule,
    };
  }),
}) {}
