import { Effect } from "effect";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export class RedisClient extends Effect.Service<RedisClient>()("RedisClient", {
  scoped: Effect.gen(function* () {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    const subscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    client.on("error", (err) => {
      Effect.runSync(Effect.logError(`Redis client error: ${String(err)}`));
    });

    subscriber.on("error", (err) => {
      Effect.runSync(Effect.logError(`Redis subscriber error: ${String(err)}`));
    });

    yield* Effect.addFinalizer(() =>
      Effect.sync(() => {
        client.removeAllListeners();
        client.disconnect();
        subscriber.removeAllListeners();
        subscriber.disconnect();
      }),
    );

    const ping = Effect.tryPromise({
      try: () => client.ping(),
      catch: (e) => new Error(`Redis ping failed: ${String(e)}`),
    });

    const set = (
      key: string,
      value: unknown,
      ttlSeconds: number,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: () => client.set(key, JSON.stringify(value), "EX", ttlSeconds),
          catch: (e) => new Error(`Redis set failed: ${String(e)}`),
        }),
      );

    const get = <T>(key: string): Effect.Effect<T | null, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: async () => {
            const data = await client.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
          },
          catch: (e) => new Error(`Redis get failed: ${String(e)}`),
        }),
      );

    const del = (key: string): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: () => client.del(key),
          catch: (e) => new Error(`Redis del failed: ${String(e)}`),
        }),
      );

    const delPattern = (pattern: string): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: async () => {
            let cursor = "0";
            do {
              const [next, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
              cursor = next;
              if (keys.length > 0) {
                await client.del(...keys);
              }
            } while (cursor !== "0");
          },
          catch: (e) => new Error(`Redis delPattern failed: ${String(e)}`),
        }),
      );

    const publish = (channel: string, message: string): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: () => client.publish(channel, message),
          catch: (e) => new Error(`Redis publish failed: ${String(e)}`),
        }),
      );

    const subscribe = (
      channel: string,
      handler: (message: string) => Effect.Effect<void, unknown, never>,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: async () => {
            await subscriber.subscribe(channel);
            subscriber.on("message", (ch, msg) => {
              if (ch === channel) {
                Effect.runFork(handler(msg));
              }
            });
          },
          catch: (e) => new Error(`Redis subscribe failed: ${String(e)}`),
        }),
      );

    const unsubscribe = (
      channel: string,
      handler: (ch: string, msg: string) => void,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.sync(() => {
          subscriber.unsubscribe(channel);
          subscriber.off("message", handler);
        }),
      );

    const psubscribe = (
      pattern: string,
      handler: (channel: string, message: string) => void,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.tryPromise({
          try: async () => {
            await subscriber.psubscribe(pattern);
            subscriber.on("pmessage", (pat, ch, msg) => {
              if (pat === pattern) {
                handler(ch, msg);
              }
            });
          },
          catch: (e) => new Error(`Redis psubscribe failed: ${String(e)}`),
        }),
      );

    const punsubscribe = (
      pattern: string,
      handler: (pattern: string, channel: string, message: string) => void,
    ): Effect.Effect<void, Error, RedisClient> =>
      Effect.flatMap(RedisClient, () =>
        Effect.sync(() => {
          subscriber.punsubscribe(pattern);
          subscriber.off("pmessage", handler);
        }),
      );

    return {
      ping,
      set,
      get,
      del,
      delPattern,
      publish,
      subscribe,
      unsubscribe,
      psubscribe,
      punsubscribe,
    } as const;
  }),
}) {}
