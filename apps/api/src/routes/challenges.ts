import { getFile } from "@api/lib/file-storage";
import { sJson } from "@api/lib/helpers";
import { ChallengeModel, CommonModel, mapPublicIdToId } from "@phena/schema";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import z from "zod/v4";
import { runPromise } from "../lib/runtime";
import { authMiddleware, requireRole } from "../middleware/auth";
import { ChallengeService } from "../services/challenge";

const app = new Hono()
  .use("/*", authMiddleware)
  .use(
    describeRoute({
      tags: ["challenges"],
      description: "Challenge endpoints",
    }),
  )
  .get(
    "/",
    describeRoute({
      responses: {
        200: {
          description: "List of all challenges",
          content: {
            "application/json": {
              schema: resolver(ChallengeModel.challengesListResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const challenges = await runPromise(ChallengeService.use((svc) => svc.getAll()));
      return sJson(c, ChallengeModel.challengesListResponse, {
        challenges: challenges.map(mapPublicIdToId),
      });
    },
  )
  .post(
    "/",
    describeRoute({
      responses: {
        201: {
          description: "Challenge created",
          content: {
            "application/json": {
              schema: resolver(ChallengeModel.challengeResponse),
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
    validator("json", ChallengeModel.createChallenge),
    async (c) => {
      const body = c.req.valid("json");

      const challenge = await runPromise(ChallengeService.use((svc) => svc.create(body)));
      return sJson(
        c,
        ChallengeModel.challengeResponse,
        { challenge: mapPublicIdToId(challenge) },
        201,
      );
    },
  )
  .get(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Challenge details",
          content: {
            "application/json": {
              schema: resolver(ChallengeModel.challengeResponse),
            },
          },
        },
        400: {
          description: "Invalid challenge ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Challenge not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("param", ChallengeModel.getChallengeParams),
    async (c) => {
      const param = c.req.valid("param");

      const challenge = await runPromise(
        ChallengeService.use((svc) => svc.getByPublicId(param.publicId)),
      );
      if (!challenge) {
        throw new HTTPException(404, { message: "Challenge not found" });
      }

      return sJson(c, ChallengeModel.challengeResponse, { challenge: mapPublicIdToId(challenge) });
    },
  )
  .put(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Challenge updated",
          content: {
            "application/json": {
              schema: resolver(ChallengeModel.challengeResponse),
            },
          },
        },
        400: {
          description: "Invalid challenge ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Challenge not found",
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
    validator("param", ChallengeModel.updateChallengeQuery),
    validator("json", ChallengeModel.updateChallenge),
    async (c) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");

      const challenge = await runPromise(
        ChallengeService.use((svc) => svc.update(param.publicId, body)),
      );
      if (!challenge) {
        throw new HTTPException(404, { message: "Challenge not found" });
      }

      return sJson(c, ChallengeModel.challengeResponse, { challenge: mapPublicIdToId(challenge) });
    },
  )
  .delete(
    "/:publicId",
    describeRoute({
      responses: {
        200: {
          description: "Challenge deleted",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Invalid challenge ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Challenge not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
      hide: process.env.NODE_ENV === "production",
    }),
    validator("param", ChallengeModel.deleteChallengeQuery),
    requireRole("admin"),
    async (c) => {
      const param = c.req.valid("param");
      const challenge = await runPromise(ChallengeService.use((svc) => svc.delete(param.publicId)));
      if (!challenge) {
        throw new HTTPException(404, { message: "Challenge not found" });
      }

      return sJson(c, CommonModel.successResponse, { message: "Challenge deleted successfully" });
    },
  )
  .post(
    "/:publicId/upload",
    describeRoute({
      responses: {
        200: {
          description: "File uploaded",
          content: {
            "application/json": {
              schema: resolver(CommonModel.successResponse),
            },
          },
        },
        400: {
          description: "Invalid file or challenge ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Challenge not found",
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
    validator("param", ChallengeModel.getChallengeParams),
    async (c) => {
      const param = c.req.valid("param");
      const formData = await c.req.parseBody();
      const file = formData["file"];

      if (!file || !(file instanceof File)) {
        throw new HTTPException(400, { message: "No file provided" });
      }

      const result = await runPromise(
        ChallengeService.use((svc) => svc.uploadFile(param.publicId, file)),
      );

      return c.json({
        message: "File uploaded successfully",
        path: result.path,
        hash: result.hash,
      });
    },
  )
  .get(
    "/:publicId/download",
    describeRoute({
      responses: {
        200: {
          description: "Download challenge file",
          content: {
            "application/octet-stream": {
              schema: resolver(z.instanceof(File)),
            },
          },
        },
        400: {
          description: "Invalid challenge ID",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
        404: {
          description: "Challenge or file not found",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    authMiddleware,
    validator("param", ChallengeModel.getChallengeParams),
    async (c) => {
      const param = c.req.valid("param");
      const challenge = await runPromise(
        ChallengeService.use((svc) => svc.getByPublicId(param.publicId)),
      );

      if (!challenge) {
        throw new HTTPException(404, { message: "Challenge not found" });
      }

      if (!challenge.filePath) {
        throw new HTTPException(404, { message: "No file attached to this challenge" });
      }

      const ext = challenge.filePath.slice(challenge.filePath.lastIndexOf("."));
      const fileData = await runPromise(getFile(challenge.publicId, ext));

      if (!fileData) {
        throw new HTTPException(404, { message: "File not found on disk" });
      }

      const fileName = `${challenge.title.replace(/[^a-z0-9]/gi, "_")}${ext}`;
      const uint8Array = new Uint8Array(fileData.buffer);

      return c.body(uint8Array, 200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": uint8Array.length.toString(),
        "X-File-Hash": fileData.hash,
      });
    },
  );

export default app;
