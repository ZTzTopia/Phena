import { Scalar } from "@scalar/hono-api-reference";
import { Effect } from "effect";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import "zod-openapi/extend";
import { AppEnvironment, BunRuntime } from "./lib/runtime";
import { checkConnectionsWithRetry } from "./lib/startup";
import { effectLogger } from "./middleware/logger";
import authRoutes from "./routes/auth";
import challengeRoutes from "./routes/challenges";
import configRoutes from "./routes/config";
import contestRoutes from "./routes/contest";
import eventRoutes from "./routes/events";
import notificationRoutes from "./routes/notifications";
import scoreboardRoutes from "./routes/scoreboard";
import serviceRoutes from "./routes/services";
import submissionRoutes from "./routes/submissions";
import systemLogRoutes from "./routes/system-logs";
import teamRoutes from "./routes/teams";
import { ContestService } from "./services/contest";

const routes = new Hono()
  .use(effectLogger())
  .use(
    "*",
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      exposeHeaders: ["Set-Cookie"],
    }),
  )
  .get("/", (c) => c.json({ name: "Phena API", version: "1.0.0" }))
  .get("/health", (c) => c.json({ status: "ok" }))
  .route("/auth", authRoutes)
  .route("/challenges", challengeRoutes)
  .route("/config", configRoutes)
  .route("/contest", contestRoutes)
  .route("/events", eventRoutes)
  .route("/notifications", notificationRoutes)
  .route("/scoreboard", scoreboardRoutes)
  .route("/services", serviceRoutes)
  .route("/submissions", submissionRoutes)
  .route("/system-logs", systemLogRoutes)
  .route("/teams", teamRoutes)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status);
    }

    Effect.runSync(Effect.logError(String(err)));
    return c.json({ error: "Internal Server Error" }, 500);
  });

const api = new Hono().route("/api", routes);
const main = new Hono()
  .get(
    "/openapi.json",
    openAPIRouteHandler(api, {
      documentation: {
        info: {
          title: "Phena API",
          version: "1.0.0",
          description: "Attack & Defense CTF Platform API",
        },
      },
    }),
  )
  .get("/docs", Scalar({ url: "/openapi.json" }))
  .route("/", api);

const program = Effect.gen(function* () {
  yield* checkConnectionsWithRetry;
  yield* ContestService.use((svc) => svc.scheduleStartIfNeeded());

  const server = Bun.serve({
    port: Number(process.env.PORT) || 3001,
    fetch: main.fetch,
  });
  yield* Effect.addFinalizer(() => Effect.sync(() => server.stop(true)));
  yield* Effect.never;
}).pipe(Effect.onExit(() => Effect.logInfo("Shutting down gracefully...")));

BunRuntime.runMain(Effect.scoped(program.pipe(Effect.provide(AppEnvironment))));
export type AppType = typeof api;
