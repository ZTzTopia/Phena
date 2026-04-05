import { sJson } from "@api/lib/helpers";
import { CommonModel, mapPublicIdToId, TeamModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { TeamService } from "../services/team";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["teams"],
      description: "Team endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "List of all teams",
          content: {
            "application/json": {
              schema: resolver(TeamModel.teamsListResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const role = c.get("auth")?.role ?? "team";
      const isAdmin = role === "admin";

      const teams = await runPromise(
        TeamService.use((svc) => (isAdmin ? svc.getAll() : svc.getAllWithoutAdmins())),
      );
      return sJson(c, TeamModel.teamsListResponse, { teams: teams.map(mapPublicIdToId) });
    },
  )
  .post(
    "/",
    describeRoute({
      responses: {
        201: {
          description: "Team created",
          content: {
            "application/json": {
              schema: resolver(TeamModel.teamResponse),
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
      hide: process.env.NODE_ENV === "production",
    }),
    requireRole("admin"),
    validator("json", TeamModel.createTeam),
    async (c) => {
      const body = c.req.valid("json");

      const team = await runPromise(
        TeamService.use((svc) =>
          svc.create({ name: body.name, password: body.password, role: "team" }),
        ),
      );
      return sJson(c, TeamModel.teamResponse, { team: mapPublicIdToId(team) }, 201);
    },
  )
  .get(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Team details",
          content: {
            "application/json": {
              schema: resolver(TeamModel.teamResponse),
            },
          },
        },
        400: {
          description: "Invalid team ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Team not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("param", TeamModel.getTeamParams),
    async (c) => {
      const param = c.req.valid("param");

      const team = await runPromise(TeamService.use((svc) => svc.getByPublicId(param.publicId)));
      if (!team) {
        throw new HTTPException(404, { message: "Team not found" });
      }

      return sJson(c, TeamModel.teamResponse, { team: mapPublicIdToId(team) });
    },
  )
  .put(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Team updated",
          content: {
            "application/json": {
              schema: resolver(TeamModel.teamResponse),
            },
          },
        },
        400: {
          description: "Invalid team ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Team not found",
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
    validator("param", TeamModel.updateTeamQuery),
    validator("json", TeamModel.updateTeam),
    async (c) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");

      const team = await runPromise(TeamService.use((svc) => svc.update(param.publicId, body)));
      if (!team) {
        throw new HTTPException(404, { message: "Team not found" });
      }

      return sJson(c, TeamModel.teamResponse, { team: mapPublicIdToId(team) });
    },
  )
  .delete(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Team deleted",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Invalid team ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Team not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    validator("param", TeamModel.deleteTeamQuery),
    requireRole("admin"),
    async (c) => {
      const param = c.req.valid("param");

      const team = await runPromise(TeamService.use((svc) => svc.delete(param.publicId)));
      if (!team) {
        throw new HTTPException(404, { message: "Team not found" });
      }

      return sJson(c, CommonModel.successResponse, { message: "Team deleted successfully" });
    },
  );

export default app;
