import { ChallengeService } from "@api/services/challenge";
import { SubmissionService } from "@api/services/submission";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect } from "effect";
import { Cause, Layer, ManagedRuntime } from "effect";
import { HTTPException } from "hono/http-exception";
import { DbLive } from "../db";
import { ServiceService } from "../services/service";
import { TeamService } from "../services/team";
import { domainErrors, type DomainError } from "./errors";
import { RedisLive } from "./redis";

const AppEnvironment = Layer.mergeAll(
  DbLive,
  RedisLive,
  BunContext.layer,
  ChallengeService.Default,
  SubmissionService.Default,
  TeamService.Default,
  ServiceService.Default,
);
const runtime = ManagedRuntime.make(AppEnvironment);

export const runPromise = async <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> => {
  const exit = await runtime.runPromiseExit(effect as any);
  if (exit._tag === "Success") {
    return exit.value as A;
  }

  const failure = Cause.failureOption(exit.cause);
  if (failure._tag === "Some") {
    const error = failure.value;

    if (error instanceof HTTPException) {
      throw error;
    }

    for (const errorClass of domainErrors) {
      if (error instanceof errorClass) {
        const domainErr = error as DomainError;
        throw new HTTPException(domainErr.statusCode, { message: domainErr.message });
      }
    }

    if (error instanceof Error) {
      throw new HTTPException(400, { message: error.message });
    }
  }

  Effect.runPromise(Effect.logError(exit.cause));
  throw new HTTPException(500, {
    message:
      process.env.NODE_ENV === "production" ? "Internal Server Error" : exit.cause.toString(),
  });
};

export const runSync = runtime.runSync;

export { BunRuntime };
