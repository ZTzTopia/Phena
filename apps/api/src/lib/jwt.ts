import type { Team } from "@api/db/schema/teams";
import type { JWTPayload } from "@phena/schema";
import { JWTPayloadSchema } from "@phena/schema";
import { sign, verify } from "hono/jwt";
import { randomBytes } from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET ?? randomBytes(16).toString("hex");

export async function signToken(
  team: Pick<Team, "publicId" | "role">,
  expiresInSeconds: number = 172800,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    {
      id: team.publicId,
      role: team.role,
      iat: now,
      exp: now + expiresInSeconds,
    },
    JWT_SECRET,
    "HS256",
  );
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    const parsedPayload = JWTPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      return null;
    }

    return parsedPayload.data;
  } catch {
    return null;
  }
}
