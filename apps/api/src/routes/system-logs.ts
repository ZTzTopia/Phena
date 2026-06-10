import { sJson } from "@api/lib/helpers";
import { CommonModel, SystemLogModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { SystemLogService } from "../services/system-log";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["system-logs"],
      description: "System log endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "System logs list",
          content: {
            "application/json": {
              schema: resolver(SystemLogModel.logsListResponse),
            },
          },
        },
      },
    }),
    requireRole("admin"),
    validator("query", CommonModel.paginationQuery),
    async (c) => {
      const { page, limit, search } = c.req.valid("query");

      const result = await runPromise(
        SystemLogService.use((svc) => svc.getAll({ page, limit, search })),
      );
      return sJson(c, SystemLogModel.logsListResponse, {
        logs: result.logs,
        pagination: result.pagination,
      });
    },
  );

export default app;
