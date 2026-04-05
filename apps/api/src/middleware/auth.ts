import type { Context, Next } from "hono";
import { AUTH_COOKIE_NAME, type Role } from "@phena/schema";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { verifyToken } from "../lib/jwt";

export interface AuthContext {
  id: string;
  role?: Role;
}

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

const getToken = (context: Context) => {
  const cookie = getCookie(context, AUTH_COOKIE_NAME);
  if (cookie) {
    return cookie;
  }

  const authHeader = context.req.raw.headers.get("Authorization");
  if (!authHeader) {
    return null;
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export async function authMiddleware(context: Context, next: Next) {
  const token = getToken(context);
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  context.set("auth", {
    id: payload.id,
    role: payload.role,
  });
  await next();
}

export function requireRole(...roles: Role[]) {
  return async (context: Context, next: Next) => {
    const auth = context.get("auth");
    if (!auth) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    if (!auth.role) {
      throw new HTTPException(403, {
        message: `You must have a role to access this resource`,
      });
    }

    if (!roles.includes(auth.role)) {
      throw new HTTPException(403, {
        message: `You are not authorized to access this resource`,
      });
    }

    await next();
  };
}

export async function optionalAuthMiddleware(context: Context, next: Next) {
  const token = getToken(context);

  if (!token) {
    context.set("auth", {
      id: "",
    });

    await next();
    return;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    context.set("auth", {
      id: "",
    });

    await next();
    return;
  }

  context.set("auth", {
    id: payload.id,
    role: payload.role,
  });
  await next();
}
