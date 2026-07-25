import { CommonModel, ConfigKey, ConfigModel, ConfigValueSchemas } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { evaluateTemplate, validateTemplate } from "../lib/flag-expression";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { ConfigService } from "../services/config";
import { ContestService } from "../services/contest";

const FLAG_PREVIEW_CONTEXTS = [
  { round: 1, tick: 1, challengeId: 1, teamId: 1, serviceId: 1, index: 0 },
  { round: 5, tick: 3, challengeId: 42, teamId: 7, serviceId: 12, index: 2 },
] as const;

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
      const entries = Object.values(ConfigKey).map((key) => ({ key, value: config[key] }));
      return c.json(entries);
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

      const parsed = ConfigValueSchemas[param.key].safeParse(body.value);
      if (!parsed.success) {
        throw new HTTPException(400, {
          message: parsed.error.issues[0]?.message ?? "Invalid value",
        });
      }

      await runPromise(ConfigService.use((svc) => svc.setConfig(param.key, parsed.data as never)));

      if (
        param.key === ConfigKey.StartDate ||
        param.key === ConfigKey.IsRunning ||
        param.key === ConfigKey.TickDuration
      ) {
        await runPromise(ContestService.use((svc) => svc.reloadSchedule()));
      }

      return c.json({ key: param.key, value: parsed.data });
    },
  )
  .post(
    "/flag-preview",
    describeRoute({
      responses: {
        200: {
          description: "Flag template preview results",
          content: {
            "application/json": {
              schema: resolver(ConfigModel.flagPreviewResponse),
            },
          },
        },
        400: {
          description: "Invalid template",
          content: {
            "application/json": {
              schema: resolver(CommonModel.multiErrorResponse),
            },
          },
        },
      },
    }),
    requireRole("admin"),
    validator("json", ConfigModel.flagPreviewRequest),
    async (c) => {
      const { template } = c.req.valid("json");
      const validation = validateTemplate(template);

      if (!validation.valid) {
        return c.json({ errors: validation.errors }, 400);
      }

      const samples = FLAG_PREVIEW_CONTEXTS.map((ctx) => {
        const result = evaluateTemplate(template, ctx);
        return {
          context: { ...ctx },
          result: result instanceof Error ? "Error" : result,
        };
      });

      return c.json({ samples });
    },
  );

export default app;
