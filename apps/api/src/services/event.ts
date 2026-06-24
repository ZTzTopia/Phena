import { RedisClient } from "@api/lib/redis";
import { SSEEventSchema, SSEEventType, type SSEEvent } from "@phena/schema";
import { Effect, Fiber, Schedule } from "effect";

type StreamWriter = (event: SSEEvent) => Effect.Effect<void, Error, never>;
type StreamAbort = () => Effect.Effect<void, Error, never>;

interface StreamHandle {
  channel: string;
  writer: StreamWriter;
  abort: StreamAbort;
  pingFiber: Fiber.RuntimeFiber<void, Error> | null;
}

const globalEventRef = globalThis as typeof globalThis & {
  __phenaActiveStreams: Set<StreamHandle>;
  __phenaChannelHandlers: Map<string, (ch: string, msg: string) => void>;
  __phenaRefCounts: Map<string, number>;
  __phenaPingFibers: Map<StreamWriter, Fiber.RuntimeFiber<void, Error>>;
};

export class EventService extends Effect.Service<EventService>()("EventService", {
  effect: Effect.gen(function* () {
    const ensureSubscribed = (channel: string): Effect.Effect<void, Error, RedisClient> =>
      Effect.gen(function* () {
        const count = globalEventRef.__phenaRefCounts.get(channel) ?? 0;
        globalEventRef.__phenaRefCounts.set(channel, count + 1);

        if (count > 0) {
          return;
        }

        const handler = (msg: string): Effect.Effect<void, unknown, never> =>
          Effect.gen(function* () {
            const event = yield* Effect.flatMap(
              Effect.try({
                try: () => JSON.parse(msg),
                catch: () => null,
              }),
              (parsed) => {
                const result = SSEEventSchema.safeParse(parsed);
                return result.success
                  ? Effect.succeed(result.data)
                  : Effect.succeed({ type: SSEEventType.Log, data: msg, timestamp: Date.now() });
              },
            );

            for (const handle of globalEventRef.__phenaActiveStreams) {
              if (handle.channel === channel) {
                yield* Effect.try({
                  try: () => {
                    if (handle.writer) {
                      Effect.runFork(handle.writer(event));
                    }
                  },
                  catch: () => {
                    globalEventRef.__phenaActiveStreams.delete(handle);
                  },
                });
              }
            }
          });

        globalEventRef.__phenaChannelHandlers.set(channel, handler);
        yield* Effect.flatMap(RedisClient, (r) => r.subscribe(channel, handler));
      });

    const maybeUnsubscribe = (channel: string): Effect.Effect<void, Error, RedisClient> =>
      Effect.gen(function* () {
        const count = (globalEventRef.__phenaRefCounts.get(channel) ?? 1) - 1;
        globalEventRef.__phenaRefCounts.set(channel, count);

        if (count > 0) {
          return;
        }

        const handler = globalEventRef.__phenaChannelHandlers.get(channel);
        if (handler) {
          yield* RedisClient.use((r) => r.unsubscribe(channel, handler));
          globalEventRef.__phenaChannelHandlers.delete(channel);
        }
      });

    const addStream = (
      channel: string,
      writer: StreamWriter,
      abort: StreamAbort,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.gen(function* () {
        if (!globalEventRef.__phenaActiveStreams) {
          globalEventRef.__phenaActiveStreams = new Set();
          globalEventRef.__phenaChannelHandlers = new Map();
          globalEventRef.__phenaRefCounts = new Map();
          globalEventRef.__phenaPingFibers = new Map();
        }

        const handle: StreamHandle = { channel, writer, abort, pingFiber: null };
        globalEventRef.__phenaActiveStreams.add(handle);
        yield* ensureSubscribed(channel);
      });

    const startPingFiber = (
      writer: StreamWriter,
      rawWriter: (s: string) => Promise<unknown>,
      role?: string,
    ): Effect.Effect<void, Error, never> =>
      Effect.sync(() => {
        let isFirstTime = true;
        const fiber = Effect.runFork(
          Effect.repeat(
            Effect.gen(function* () {
              if (isFirstTime) {
                yield* writer({
                  type: SSEEventType.Connected,
                  data: { role },
                  timestamp: Date.now(),
                });
                isFirstTime = false;
                return 0;
              }

              yield* Effect.tryPromise({
                try: () => rawWriter(": keepalive\n\n"),
                catch: (e) => new Error(`Keepalive write failed: ${String(e)}`),
              });
              return 0;
            }),
            Schedule.fixed("4 seconds"),
          ),
        ) as Fiber.RuntimeFiber<void, Error>;

        globalEventRef.__phenaPingFibers.set(writer, fiber);
      });

    const removeStream = (writer: StreamWriter): Effect.Effect<void, Error, RedisClient> =>
      Effect.sync(() => {
        const pingFiber = globalEventRef.__phenaPingFibers.get(writer);
        if (pingFiber) {
          Effect.runFork(Fiber.interrupt(pingFiber));
          globalEventRef.__phenaPingFibers.delete(writer);
        }

        for (const handle of globalEventRef.__phenaActiveStreams) {
          if (handle.writer === writer) {
            if (handle.pingFiber) {
              Effect.runFork(Fiber.interrupt(handle.pingFiber));
            }

            globalEventRef.__phenaActiveStreams.delete(handle);
            Effect.runFork(maybeUnsubscribe(handle.channel) as Effect.Effect<void, Error, never>);
            break;
          }
        }
      });

    const cleanupAll = Effect.sync(() => {
      for (const handle of globalEventRef.__phenaActiveStreams) {
        Effect.runFork(handle.abort());
        if (handle.pingFiber) {
          Effect.runFork(Fiber.interrupt(handle.pingFiber));
        }
      }

      globalEventRef.__phenaActiveStreams.clear();

      for (const [channel, handler] of globalEventRef.__phenaChannelHandlers) {
        Effect.runFork(
          RedisClient.use((r) => r.unsubscribe(channel, handler)) as Effect.Effect<
            void,
            Error,
            never
          >,
        );
      }

      globalEventRef.__phenaChannelHandlers.clear();
      globalEventRef.__phenaRefCounts.clear();

      for (const [, fiber] of globalEventRef.__phenaPingFibers) {
        Effect.runFork(Fiber.interrupt(fiber));
      }

      globalEventRef.__phenaPingFibers.clear();
    });

    yield* Effect.succeed(null);

    return { addStream, startPingFiber, removeStream, cleanupAll };
  }),
}) {}
