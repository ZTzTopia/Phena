import { sJson } from "@api/lib/helpers";
import { verifyPassword } from "@api/lib/password";
import { authMiddleware, optionalAuthMiddleware } from "@api/middleware/auth";
import { AUTH_COOKIE_NAME, COOKIE_OPTIONS } from "@phena/schema";
import { AuthModel, CommonModel } from "@phena/schema";
import { Effect } from "effect";
import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { deleteCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { signToken } from "../lib/jwt";
import { runPromise } from "../lib/runtime";
import { TeamService } from "../services/team";

const app = new Hono()
  .post(
    "/register",
    describeRoute({
      tags: ["auth"],
      responses: {
        201: {
          description: "Team registered successfully",
          content: {
            "application/json": {
              schema: resolver(AuthModel.registerResponse),
            },
          },
        },
        400: {
          description: "Registration failed",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("json", AuthModel.register),
    async (c) => {
      const { name, password } = c.req.valid("json");

      // oxlint-disable-next-line no-constant-condition
      for (; 1; ) {
        throw new HTTPException(418, { message: "I'm a teapot" });
      }

      const result = await runPromise(
        TeamService.use((svc) =>
          svc.create({ name, password, role: "team" }).pipe(
            Effect.flatMap((team) =>
              Effect.tryPromise({
                try: () =>
                  signToken({
                    publicId: team.publicId,
                    role: team.role,
                  }),
                catch: (e) => new Error(String(e)),
              }).pipe(Effect.map((token) => ({ team, token }))),
            ),
          ),
        ),
      );

      return sJson(
        c,
        AuthModel.registerResponse,
        {
          team: {
            id: result.team.publicId,
            name: result.team.name,
            role: result.team.role,
          },
          token: result.token,
        },
        201,
      );
    },
  )
  .post(
    "/login",
    describeRoute({
      tags: ["auth"],
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: resolver(AuthModel.loginResponse),
            },
          },
        },
        401: {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    validator("json", AuthModel.login),
    async (c) => {
      const { name, password, role } = c.req.valid("json");

      const team = await runPromise(TeamService.use((svc) => svc.getByName(name)));
      if (!team) {
        throw new HTTPException(401, { message: "Invalid credentials" });
      }

      if (role && team.role !== role) {
        throw new HTTPException(403, { message: "Invalid credentials for this login" });
      }

      const valid = await runPromise(verifyPassword(password, team.password));
      if (!valid) {
        throw new HTTPException(401, { message: "Invalid credentials" });
      }

      const token = await signToken({
        publicId: team.publicId,
        role: team.role,
      });

      setCookie(c, AUTH_COOKIE_NAME, token, COOKIE_OPTIONS);

      return sJson(c, AuthModel.loginResponse, {
        team: {
          id: team.publicId,
          name: team.name,
          role: team.role,
        },
      });
    },
  )
  .post(
    "/logout",
    describeRoute({
      tags: ["auth"],
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: resolver(AuthModel.logoutResponse),
            },
          },
        },
      },
    }),
    optionalAuthMiddleware,
    async (c) => {
      deleteCookie(c, AUTH_COOKIE_NAME, { path: "/" });
      return sJson(c, AuthModel.logoutResponse, { message: "Logged out successfully" });
    },
  )
  .get(
    "/me",
    describeRoute({
      tags: ["auth"],
      responses: {
        200: {
          description: "Current user data",
          content: {
            "application/json": {
              schema: resolver(AuthModel.meResponse),
            },
          },
        },
        401: {
          description: "Not authorized",
          content: {
            "application/json": {
              schema: resolver(CommonModel.errorResponse),
            },
          },
        },
      },
    }),
    authMiddleware,
    async (c) => {
      const auth = c.get("auth");
      if (!auth) {
        throw new HTTPException(401, { message: "Unauthorized" });
      }

      const team = await runPromise(TeamService.use((svc) => svc.getByPublicId(auth.id)));
      if (!team) {
        throw new HTTPException(401, { message: "Team not found" });
      }

      return sJson(c, AuthModel.meResponse, {
        team: {
          id: team.publicId,
          name: team.name,
          role: team.role,
        },
      });
    },
  );

export default app;
