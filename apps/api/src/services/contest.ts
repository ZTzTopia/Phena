import { ConfigKey } from "@phena/schema";
import { Effect, Fiber } from "effect";
import { ConfigService } from "./config";

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

        const isRunningStr = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (isRunningStr !== "true") {
          return;
        }

        const tickDurationStr = yield* ConfigService.use((svc) =>
          svc.getConfig(ConfigKey.TickDuration),
        );
        const tickDuration = parseInt(String(tickDurationStr), 10);

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
        const isRunningStr = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (isRunningStr === "true") {
          yield* Effect.fail(new Error("Contest is already running"));
          return;
        }

        yield* startScheduler();
        yield* ConfigService.use((svc) => svc.setConfig(ConfigKey.IsRunning, true));
      });

    const scheduleStartIfNeeded = () =>
      Effect.gen(function* () {
        const startDateStr = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.StartDate));
        const startDate = new Date(String(startDateStr));
        const now = new Date();
        const delayMs = startDate.getTime() - now.getTime();

        if (delayMs <= 0) {
          const isRunningStr = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.IsRunning),
          );
          if (isRunningStr !== "true") {
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
        const isRunningStr = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        if (isRunningStr !== "true") {
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

          const currentTickStr = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.CurrentTick),
          );
          const tickPerRoundStr = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.TickPerRound),
          );
          const currentRoundStr = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.CurrentRound),
          );
          const totalRoundsStr = yield* ConfigService.use((svc) =>
            svc.getConfig(ConfigKey.TotalRounds),
          );

          const currentTick = parseInt(String(currentTickStr), 10);
          const tickPerRound = parseInt(String(tickPerRoundStr), 10);
          const currentRound = parseInt(String(currentRoundStr), 10);
          const totalRounds = parseInt(String(totalRoundsStr), 10);

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
