import { sql } from "drizzle-orm";
import { Data, Effect, Schedule } from "effect";
import { db } from "../db";
import { redis } from "./redis";

export class PostgresConnectionError extends Data.TaggedError("PostgresConnectionError")<{
  readonly cause: unknown;
}> {}

export class RedisConnectionError extends Data.TaggedError("RedisConnectionError")<{
  readonly cause: unknown;
}> {}

const checkPostgres = Effect.tryPromise({
  try: async () => {
    await db.execute(sql`SELECT 1`);
  },
  catch: (e) => new PostgresConnectionError({ cause: e }),
}).pipe(Effect.tap(() => Effect.logInfo("Postgres connected")));

const checkRedis = Effect.tryPromise({
  try: async () => {
    await redis.ping();
  },
  catch: (e) => new RedisConnectionError({ cause: e }),
}).pipe(Effect.tap(() => Effect.logInfo("Redis connected")));

const checkConnections = Effect.gen(function* () {
  yield* Effect.logInfo("Checking Postgres connection...");
  yield* Effect.logInfo("Checking Redis connection...");
  yield* Effect.all([checkPostgres, checkRedis], { concurrency: "unbounded" });
});

const retryPolicy = Schedule.exponential("1 second").pipe(Schedule.compose(Schedule.recurs(5)));

export const checkConnectionsWithRetry = checkConnections.pipe(
  Effect.retry(retryPolicy),
  Effect.catchAll((e) =>
    Effect.gen(function* () {
      yield* Effect.logError(`Failed to connect: ${e._tag}`);
      yield* Effect.logError("Exiting process...");
      process.exit(1);
    }),
  ),
);
