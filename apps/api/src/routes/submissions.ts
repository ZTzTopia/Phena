import { sJson } from "@api/lib/helpers";
import { TeamRepository } from "@api/repositories/teams";
import { CommonModel, SubmissionsModel, type Submission } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { SubmissionService } from "../services/submission";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["submissions"],
      description: "Submission endpoints",
    }),
  )
  .post(
    "/",
    describeRoute({
      tags: ["submissions"],
      responses: {
        200: {
          description: "Flag submission result",
          content: {
            "application/json": {
              schema: resolver(SubmissionsModel.submissionResponse),
            },
          },
        },
        500: {
          description: "Server error",
          content: {
            "application/json": {
              schema: resolver(SubmissionsModel.submissionResponse),
            },
          },
        },
      },
    }),
    requireRole("team"),
    validator("json", SubmissionsModel.submissionBody),
    async (c) => {
      const auth = c.get("auth");
      const body = c.req.valid("json");

      if (!Array.isArray(body.flags)) {
        body.flags = [body.flags];
      }

      const team = await runPromise(TeamRepository.findByPublicId(auth.id));
      if (!team) {
        return sJson(c, SubmissionsModel.submissionResponse, {
          results: [],
        });
      }

      let submissions = new Array<Pick<Submission, "value" | "status">>();
      for (const flag of body.flags) {
        const submission = await runPromise(
          SubmissionService.use((svc) =>
            svc.submit({
              teamId: team.id,
              value: flag,
            }),
          ),
        );
        if (submission) {
          submissions.push({
            value: flag,
            status: submission.status,
          });
        }
      }

      return sJson(c, SubmissionsModel.submissionResponse, {
        results: submissions,
      });
    },
  )
  .get(
    "/",
    describeRoute({
      tags: ["submissions"],
      responses: {
        200: {
          description: "Submissions list",
          content: {
            "application/json": {
              schema: resolver(SubmissionsModel.submissionsHistoryResponse),
            },
          },
        },
        400: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("query", CommonModel.paginationQuery),
    async (c) => {
      const auth = c.get("auth");
      const isAdmin = auth.role === "admin";
      const { page, limit, search } = c.req.valid("query");

      const team = await runPromise(TeamRepository.findByPublicId(auth.id));
      if (!team) {
        return sJson(c, SubmissionsModel.submissionsHistoryResponse, {
          submissions: [],
          pagination: { total: 0, page: page, limit: limit, totalPages: 0 },
        });
      }

      const result = await runPromise(
        SubmissionService.use((svc) =>
          isAdmin
            ? svc.getAll({ page, limit, search })
            : svc.getByTeamId(team.id, { page, limit, search }),
        ),
      );

      return sJson(c, SubmissionsModel.submissionsHistoryResponse, {
        submissions: result.submissions,
        pagination: result.pagination,
      });
    },
  );

export default app;
