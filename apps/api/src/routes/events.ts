import { EventChannels, EventManager, type Event } from "@api/lib/event-manager";
import { RedisClient } from "@api/lib/redis";
import { runPromise } from "@api/lib/runtime";
import { optionalAuthMiddleware } from "@api/middleware/auth";
import { CommonModel, EventModel } from "@phena/schema";
import { Effect } from "effect";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { streamSSE } from "hono/streaming";

const app = new Hono()
  .use("/", optionalAuthMiddleware)
  .use(
    describeRoute({
      tags: ["events"],
      hide: process.env.NODE_ENV === "production",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        201: {
          description: "Team created",
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    async (c) => {
      const auth = c.get("auth");

      // Wait is Javascript have garbage collector? if no then
      // we need to manually clean up resources when the stream is aborted.
      return streamSSE(
        c,
        async (stream) => {
          await stream.writeSSE({
            event: "connected",
            data: JSON.stringify({
              type: "connected",
              timestamp: Date.now(),
              role: auth?.role ?? "anonymous",
            }),
          });

          const pingInterval = setInterval(async () => {
            await stream.writeSSE({
              event: "ping",
              data: JSON.stringify({ type: "ping", timestamp: Date.now() }),
            });
          }, 2500);

          stream.onAbort(() => {
            clearInterval(pingInterval);
          });

          // FIXME: There is a bug where the stream is stuck open after hot reload,
          // causing a memory leak. If this below code uncommented, the stream will
          // be stuck and not sending the ping event.
          // const writeEvent = (event: Event) => {
          //   stream.writeSSE({
          //     event: event.type,
          //     data: JSON.stringify(event),
          //   });
          // };

          // stream.onAbort(async () => {
          //   await runPromise(EventManager.removeStream(EventChannels.Global, writeEvent));
          // });

          // await runPromise(EventManager.addStream(EventChannels.Global, writeEvent));

          // if (auth?.teamPublicId) {
          //   stream.onAbort(async () => {
          //     await runPromise(
          //       EventManager.removeStream(EventChannels.Team(auth.teamPublicId), writeEvent),
          //     );
          //   });

          //   await runPromise(
          //     EventManager.addStream(EventChannels.Team(auth.teamPublicId), writeEvent),
          //   );
          // }

          // We need to check stream.aborted to prevent
          // infinite loop when the stream is aborted.
          // If im not mistakken in ElysiaJS they handle
          // to stop the true while loop gracefully?
          //
          // Also there is hot reloading issue, where the stream
          // is not aborted properly on hot reload, causing a leak.
          // see above comment about the "FIXME".
          while (!stream.aborted) {
            await stream.sleep(150);
          }

          await runPromise(Effect.log("stream closed"));
        },
        async (err, stream) => {
          stream.writeln("An error occurred!");
          console.error(err);
        },
      );
    },
  )
  .post(
    "/publish",
    describeRoute({
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
      if (!auth) {
        return c.json({ message: "Unauthorized" }, 401);
      }

      const body = c.req.valid("json");
      if (auth.role !== "admin") {
        await runPromise(RedisClient.publish(EventChannels.Team(auth.id), body.message));
        return c.json({ message: "Successfully published event to team channel" });
      }

      if (body.teamId) {
        await runPromise(
          RedisClient.publish(EventChannels.Team(body.teamId), JSON.stringify(body)),
        );
        return c.json({ message: "Successfully published event to team channel" });
      }

      await runPromise(RedisClient.publish(EventChannels.Global, JSON.stringify(body)));
      return c.json({ message: "Successfully published event to global channel" });
    },
  );

export default app;
