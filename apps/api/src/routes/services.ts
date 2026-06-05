import { sJson } from "@api/lib/helpers";
import { TeamRepository } from "@api/repositories/teams";
import { CommonModel, ServiceModel } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import { runPromise } from "../lib/runtime";
import { authMiddleware, optionalAuthMiddleware, requireRole } from "../middleware/auth";
import { ServiceService } from "../services/service";

const app = new Hono()
  .use(
    describeRoute({
      tags: ["services"],
      description: "Service instance endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "List of all services",
          content: {
            "application/json": {
              schema: resolver(ServiceModel.servicesListResponse),
            },
          },
        },
      },
    }),
    authMiddleware,
    requireRole("admin"),
    validator("query", CommonModel.paginationQuery),
    async (c) => {
      const { page, limit, search } = c.req.valid("query");
      const result = await runPromise(
        ServiceService.use((svc) => svc.getAll({ page, limit, search })),
      );
      return sJson(c, ServiceModel.servicesListResponse, {
        services: result.services,
        pagination: result.pagination,
      });
    },
  )
  .get(
    "/missing",
    describeRoute({
      responses: {
        200: {
          description: "List of missing services (team-challenge pairs without services)",
        },
      },
    }),
    authMiddleware,
    requireRole("admin"),
    async (c) => {
      const missing = await runPromise(ServiceService.use((svc) => svc.findMissingServices()));
      return c.json({ missing });
    },
  )
  .post(
    "/auto-create",
    describeRoute({
      responses: {
        200: {
          description: "Auto-create missing services",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    authMiddleware,
    requireRole("admin"),
    async (c) => {
      const created = await runPromise(ServiceService.use((svc) => svc.autoCreateAllMissing()));
      return sJson(c, CommonModel.successResponse, {
        message: `Created ${created.length} missing services`,
      });
    },
  )

  .get(
    "/team/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Team's services",
          content: {
            "application/json": {
              schema: resolver(ServiceModel.servicesListResponse),
            },
          },
        },
      },
    }),
    authMiddleware,
    validator("param", CommonModel.publicIdParam),
    validator("query", CommonModel.paginationQuery),
    async (c) => {
      const param = c.req.valid("param");
      const auth = c.get("auth");
      const { page, limit, search } = c.req.valid("query");

      if (auth.role !== "admin" && auth.id !== param.publicId) {
        throw new HTTPException(403, { message: "Access denied" });
      }

      const result = await runPromise(
        ServiceService.use((svc) => svc.getByTeamId(auth.id, { page, limit, search })),
      );
      return sJson(c, ServiceModel.servicesListResponse, {
        services: result.services,
        pagination: result.pagination,
      });
    },
  )
  .get(
    "/:id",
    describeRoute({
      responses: {
        200: {
          description: "Service details",
          content: {
            "application/json": {
              schema: resolver(ServiceModel.serviceDetailResponse),
            },
          },
        },
        404: {
          description: "Service not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    optionalAuthMiddleware,
    validator("param", ServiceModel.serviceParams),
    async (c) => {
      const { id } = c.req.valid("param");
      const service = await runPromise(ServiceService.use((svc) => svc.getById(id)));
      if (!service) {
        throw new HTTPException(404, { message: "Service not found" });
      }

      return c.json({ service });
    },
  )
  .post(
    "/:id/operations",
    describeRoute({
      responses: {
        201: {
          description: "Operation created",
          content: {
            "application/json": {
              schema: resolver(ServiceModel.serviceOperationResponse),
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
        404: {
          description: "Service not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    authMiddleware,
    requireRole("admin"),
    validator("param", ServiceModel.serviceParams),
    validator("json", ServiceModel.createServiceOperation),
    async (c) => {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");
      const auth = c.get("auth");

      const team = await runPromise(TeamRepository.findByPublicId(auth.id));
      if (!team) {
        return c.json({ message: "Team not found" }, 404);
      }

      const operation = await runPromise(
        ServiceService.use((svc) =>
          svc.createOperation({
            serviceId: id,
            adminId: team.id,
            type: body.type,
          }),
        ),
      );

      return sJson(c, ServiceModel.serviceOperationResponse, { operation }, 201);
    },
  )
  .post(
    "/checker/results",
    describeRoute({
      responses: {
        200: {
          description: "Checker result submitted",
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
        404: {
          description: "Service not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    optionalAuthMiddleware,
    validator("json", ServiceModel.checkerResult),
    async (c) => {
      const body = c.req.valid("json");

      const checkedAt =
        body.checked_at instanceof Date ? body.checked_at : new Date(body.checked_at);

      await runPromise(
        ServiceService.use((svc) =>
          svc.submitCheckerResult({
            serviceId: body.service_id,
            teamId: body.team_id,
            challengeId: body.challenge_id,
            round: body.round,
            tick: body.tick,
            status: body.status,
            message: body.message,
            checkedAt,
          }),
        ),
      );

      return sJson(c, CommonModel.successResponse, { message: "Checker result submitted" });
    },
  );

export default app;
