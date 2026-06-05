import { CommonModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { runPromise } from "../lib/runtime";
import { optionalAuthMiddleware, requireRole } from "../middleware/auth";
import { ConfigService } from "../services/config";
import { ContestService } from "../services/contest";

const app = new Hono()
  .use("/*", optionalAuthMiddleware)
  .use(
    describeRoute({
      tags: ["contest"],
      description: "Contest lifecycle endpoints",
      hide: process.env.NODE_ENV === "production",
    }),
  )
  .post(
    "/start",
    describeRoute({
      responses: {
        200: {
          description: "Contest started successfully",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Contest is already running",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    requireRole("admin"),
    async (c) => {
      await runPromise(ContestService.use((svc) => svc.startContest()));
      return c.json({ message: "Contest started" });
    },
  )
  .post(
    "/stop",
    describeRoute({
      responses: {
        200: {
          description: "Contest stopped successfully",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Contest is not running",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    requireRole("admin"),
    async (c) => {
      await runPromise(ContestService.use((svc) => svc.stopContest()));
      return c.json({ message: "Contest stopped" });
    },
  )
  .get(
    "/status",
    describeRoute({
      responses: {
        200: {
          description: "Contest status",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const config = await runPromise(ConfigService.use((svc) => svc.getAllConfig()));
      return c.json({
        isRunning: config.isRunning,
        currentTick: config.currentTick,
        currentRound: config.currentRound,
        startDate: config.startDate,
      });
    },
  );

export default app;
