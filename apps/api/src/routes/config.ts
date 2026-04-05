import { CommonModel, ConfigKey, ConfigModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { ConfigService } from "../services/config";
import { ContestService } from "../services/contest";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["config"],
      description: "Config endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "All config values merged with defaults",
          content: {
            "application/json": {
              schema: resolver(ConfigModel.configListResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const config = await runPromise(ConfigService.use((svc) => svc.getAllConfig()));
      return c.json(config);
    },
  )
  .get(
    "/:key",
    describeRoute({
      responses: {
        200: {
          description: "Config value for key",
          content: {
            "application/json": {
              schema: resolver(ConfigModel.configResponse),
            },
          },
        },
        400: {
          description: "Invalid config key",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Config key not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("param", ConfigModel.configParams),
    async (c) => {
      const param = c.req.valid("param");
      const value = await runPromise(ConfigService.use((svc) => svc.getConfig(param.key)));
      return c.json({ key: param.key, value });
    },
  )
  .put(
    "/:key",
    describeRoute({
      responses: {
        200: {
          description: "Config value updated",
          content: {
            "application/json": {
              schema: resolver(ConfigModel.configResponse),
            },
          },
        },
        400: {
          description: "Invalid config key or value",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    requireRole("admin"),
    validator("param", ConfigModel.configParams),
    validator("json", ConfigModel.configBody),
    async (c) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");

      await runPromise(ConfigService.use((svc) => svc.setConfig(param.key, body.value)));

      if (
        param.key === ConfigKey.StartDate ||
        param.key === ConfigKey.IsRunning ||
        param.key === ConfigKey.TickDuration
      ) {
        await runPromise(ContestService.use((svc) => svc.reloadSchedule()));
      }

      return c.json({ key: param.key, value: body.value });
    },
  );

export default app;
