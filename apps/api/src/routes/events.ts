import { RedisClient } from "@api/lib/redis";
import { runPromise } from "@api/lib/runtime";
import { optionalAuthMiddleware } from "@api/middleware/auth";
import { EventService } from "@api/services/event";
import { CommonModel, EventModel, SSE_EVENT_CHANNELS, type SSEEvent } from "@phena/schema";
import { Deferred, Effect } from "effect";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { streamSSE } from "hono/streaming";
import { nanoid } from "nanoid";

const app = new Hono()
  .use("/*", optionalAuthMiddleware)
  .get(
    "/",
    describeRoute({
      tags: ["events"],
      responses: { 200: { description: "SSE event stream" } },
      hide: process.env.NODE_ENV === "production",
    }),
    async (c) => {
      const auth = c.get("auth");

      // FIXME: There is still an issue with Hot Reloading, but for now i think
      // the issue is not too bad.
      return streamSSE(
        c,
        async (stream) => {
          const writer = (event: SSEEvent) =>
            Effect.tryPromise({
              try: () =>
                stream.writeSSE({
                  event: event.type,
                  data: JSON.stringify(
                    typeof event.data === "object"
                      ? { ...event.data, timestamp: event.timestamp }
                      : { data: event.data, timestamp: event.timestamp },
                  ),
                  id: nanoid(), // Umm, what this use case? is for replaying the
                  // event after a client reconnect? is the server already handle
                  // it internally?
                }),
              catch: (e) => new Error(`Stream write failed: ${String(e)}`),
            });

          const abort = () =>
            Effect.try({
              try: () => {
                stream.abort();
              },
              catch: (e) => new Error(`Stream abort failed: ${String(e)}`),
            });

          await runPromise(
            Effect.gen(function* () {
              const deferred = yield* Deferred.make<void, never>();

              yield* EventService.use((svc) =>
                svc.addStream(SSE_EVENT_CHANNELS.Global, writer, abort),
              );

              if (auth.id) {
                yield* EventService.use((svc) =>
                  svc.addStream(SSE_EVENT_CHANNELS.Team(auth.id), writer, abort),
                );
              }

              yield* EventService.use((svc) => svc.startPingFiber(writer, auth.role));

              stream.onAbort(() => {
                runPromise(EventService.use((svc) => svc.removeStream(writer)));
                runPromise(Deferred.complete(deferred, Effect.void));
              });

              yield* Deferred.await(deferred);
            }).pipe(Effect.scoped),
          );
        },
        async (err, stream) => {
          stream.writeln("An error occurred!");
          Effect.runSync(Effect.logError(String(err)));
        },
      );
    },
  )
  .post(
    "/publish",
    describeRoute({
      tags: ["events"],
      responses: {
        200: {
          description: "Event published",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Invalid request body",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("json", EventModel.publishBody),
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");

      if (auth.role !== "admin") {
        await runPromise(
          RedisClient.use((r) => r.publish(SSE_EVENT_CHANNELS.Team(auth.id), body.data)),
        );
        return c.json({ message: "Successfully published event to team channel" });
      }

      if (body.teamId) {
        await runPromise(
          RedisClient.use((r) =>
            r.publish(SSE_EVENT_CHANNELS.Team(body.teamId!), JSON.stringify(body)),
          ),
        );
        return c.json({ message: "Successfully published event to team channel" });
      }

      await runPromise(
        RedisClient.use((r) => r.publish(SSE_EVENT_CHANNELS.Global, JSON.stringify(body))),
      );
      return c.json({ message: "Successfully published event to global channel" });
    },
  );

export default app;
