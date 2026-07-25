import { sJson } from "@api/lib/helpers";
import { NotificationModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { TeamRepository } from "../repositories/teams";
import { NotificationService } from "../services/notification";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["notifications"],
      description: "Notification endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "List notifications for the current team (global + team-scoped)",
          content: {
            "application/json": {
              schema: resolver(NotificationModel.listResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const auth = c.get("auth");
      const notifications = await runPromise(
        NotificationService.use((svc) => svc.forPublicId(auth.id)),
      );
      return sJson(c, NotificationModel.listResponse, { notifications });
    },
  )
  .post(
    "/",
    describeRoute({
      responses: {
        201: {
          description: "Create a notification",
          content: {
            "application/json": {
              schema: resolver(NotificationModel.listResponse),
            },
          },
        },
        404: {
          description: "Team not found",
        },
      },
    }),
    requireRole("admin"),
    validator("json", NotificationModel.createBody),
    async (c) => {
      const { message, teamPublicId } = c.req.valid("json");

      if (!teamPublicId) {
        await runPromise(NotificationService.use((svc) => svc.notify(message, undefined)));
        return c.json({ success: true }, 201);
      }

      const team = await runPromise(TeamRepository.findByPublicId(teamPublicId));
      if (!team) {
        throw new HTTPException(404, { message: "Team not found" });
      }

      await runPromise(NotificationService.use((svc) => svc.notify(message, team.id)));
      return c.json({ success: true }, 201);
    },
  );

export default app;
