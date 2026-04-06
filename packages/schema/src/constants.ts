export const AUTH_COOKIE_NAME = "phena_token";
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} as const;

export const SSE_EVENT_CHANNELS = {
  Global: "phena:events",
  Team: (teamId: string) => `phena:team:${teamId}`,
} as const;
