import { ChallengeService } from "@api/services/challenge";
import { ConfigService } from "@api/services/config";
import { EventService } from "@api/services/event";
import { SubmissionService } from "@api/services/submission";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Cause, Effect, Layer, ManagedRuntime } from "effect";
import { HTTPException } from "hono/http-exception";
import { DbLive } from "../db";
import { ContestService } from "../services/contest";
import { ServiceService } from "../services/service";
import { TeamService } from "../services/team";
import { domainErrors, type DomainError } from "./errors";
import { RedisClient } from "./redis";

const AppEnvironment = Layer.mergeAll(
  DbLive,
  RedisClient.Default,
  BunContext.layer,
  ChallengeService.Default,
  ConfigService.Default,
  EventService.Default,
  SubmissionService.Default,
  TeamService.Default,
  ServiceService.Default,
  ContestService.Default,
);
const runtime = ManagedRuntime.make(AppEnvironment);

function isDomainError(error: unknown): error is DomainError {
  return domainErrors.some((cls) => error instanceof cls);
}

export const runPromise = async <A, E, R>(effect: Effect.Effect<A, E, R>): Promise<A> => {
  const exit = await runtime.runPromiseExit(effect as Effect.Effect<A, E>);
  if (exit._tag === "Success") {
    return exit.value;
  }

  const failure = Cause.failureOption(exit.cause);
  if (failure._tag === "Some") {
    const error = failure.value;
    Effect.runSync(Effect.logError(error));

    if (error instanceof HTTPException) {
      throw error;
    }

    if (isDomainError(error)) {
      throw new HTTPException(error.statusCode, { message: error.message });
    }

    if (error instanceof Error) {
      throw new HTTPException(400, { message: error.message });
    }
  }

  Effect.runSync(Effect.logError(exit.cause));
  throw new HTTPException(500, {
    message:
      process.env.NODE_ENV === "production" ? "Internal Server Error" : exit.cause.toString(),
  });
};

export const runSync = runtime.runSync;

export { BunRuntime };
