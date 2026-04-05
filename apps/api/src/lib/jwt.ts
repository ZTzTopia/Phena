import type { Team } from "@api/db/schema/teams";
import type { JWTPayload } from "@phena/schema";
import { sign, verify } from "hono/jwt";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET ?? "061006";

const jwtPayloadSchema = z.object({
  id: z.string(),
  role: z.enum(["admin", "team"]),
  iat: z.number(),
  exp: z.number(),
});

export async function signToken(team: Pick<Team, "publicId" | "role">): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    {
      id: team.publicId,
      role: team.role,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    },
    JWT_SECRET,
    "HS256",
  );
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    const parsedPayload = jwtPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
      return null;
    }

    return parsedPayload.data;
  } catch {
    return null;
  }
}

export async function signTempToken(
  team: { teamId: number; teamPublicId: string; role: string },
  expiresInSeconds: number = 60 * 5,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    {
      teamId: team.teamId,
      teamPublicId: team.teamPublicId,
      role: team.role,
      iat: now,
      exp: now + expiresInSeconds,
    },
    JWT_SECRET,
    "HS256",
  );
}
