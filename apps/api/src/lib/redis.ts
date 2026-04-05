import { Context, Effect, Layer } from "effect";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  Effect.runSync(Effect.logError(`Redis connection error: ${String(err)}`));
});

export class RedisClient extends Context.Tag("RedisClient")<
  RedisClient,
  { readonly redis: Redis }
>() {}

export const RedisLive = Layer.effect(
  RedisClient,
  Effect.sync(() => ({ redis })),
);

export namespace RedisClient {
  export const set = (
    key: string,
    value: unknown,
    ttlSeconds: number,
  ): Effect.Effect<void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: () => redis.set(key, JSON.stringify(value), "EX", ttlSeconds),
        catch: (e) => new Error(`Redis set failed: ${String(e)}`),
      }),
    );

  export const get = <T>(key: string): Effect.Effect<T | null, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: async () => {
          const data = await redis.get(key);
          if (!data) return null;
          return JSON.parse(data) as T;
        },
        catch: (e) => new Error(`Redis get failed: ${String(e)}`),
      }),
    );

  export const del = (key: string): Effect.Effect<void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: () => redis.del(key),
        catch: (e) => new Error(`Redis del failed: ${String(e)}`),
      }),
    );

  export const delPattern = (pattern: string): Effect.Effect<void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: async () => {
          let cursor = "0";
          do {
            const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = next;
            if (keys.length > 0) {
              await redis.del(...keys);
            }
          } while (cursor !== "0");
        },
        catch: (e) => new Error(`Redis delPattern failed: ${String(e)}`),
      }),
    );

  export const publish = (
    channel: string,
    message: string,
  ): Effect.Effect<void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: () => redis.publish(channel, message),
        catch: (e) => new Error(`Redis publish failed: ${String(e)}`),
      }),
    );

  export const subscribe = (
    channel: string,
    handler: (message: string) => void,
  ): Effect.Effect<() => void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: async () => {
          const subscriber = redis.duplicate();
          await new Promise<void>((resolve, reject) => {
            subscriber.subscribe(channel);
            subscriber.once("subscribe", () => resolve());
            subscriber.once("error", reject);
          });
          subscriber.on("message", (ch, msg) => {
            if (ch === channel) {
              handler(msg);
            }
          });
          return () => {
            subscriber.unsubscribe(channel);
            subscriber.disconnect();
          };
        },
        catch: (e) => new Error(`Redis subscribe failed: ${String(e)}`),
      }),
    );

  export const psubscribe = (
    pattern: string,
    handler: (channel: string, message: string) => void,
  ): Effect.Effect<() => void, Error, RedisClient> =>
    Effect.flatMap(RedisClient, ({ redis }) =>
      Effect.tryPromise({
        try: async () => {
          const subscriber = redis.duplicate();
          await new Promise<void>((resolve, reject) => {
            subscriber.psubscribe(pattern);
            subscriber.once("psubscribe", () => resolve());
            subscriber.once("error", reject);
          });
          subscriber.on("pmessage", (pat, ch, msg) => {
            if (pat === pattern) {
              handler(ch, msg);
            }
          });
          return () => {
            subscriber.punsubscribe(pattern);
            subscriber.disconnect();
          };
        },
        catch: (e) => new Error(`Redis psubscribe failed: ${String(e)}`),
      }),
    );
}
