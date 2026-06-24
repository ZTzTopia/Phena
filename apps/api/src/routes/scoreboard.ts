import { sJson } from "@api/lib/helpers";
import { ScoreboardModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import { runPromise } from "../lib/runtime";
import { authMiddleware } from "../middleware/auth";
import { ScoreService } from "../services/score";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["scoreboard"],
      description: "Scoreboard endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      tags: ["scoreboard"],
      responses: {
        200: {
          description: "Current standings",
          content: {
            "application/json": {
              schema: resolver(ScoreboardModel.standingsResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const standings = await runPromise(
        ScoreService.use((svc) => svc.getStandingsWithBreakdown()),
      );
      return sJson(c, ScoreboardModel.standingsResponse, { standings });
    },
  )
  .get(
    "/history",
    describeRoute({
      tags: ["scoreboard"],
      responses: {
        200: {
          description: "Score history (time series)",
          content: {
            "application/json": {
              schema: resolver(ScoreboardModel.historyResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const history = await runPromise(ScoreService.use((svc) => svc.getHistory()));
      return sJson(c, ScoreboardModel.historyResponse, { history });
    },
  );

export default app;
