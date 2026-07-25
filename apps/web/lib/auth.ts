import type { Role, TeamResponse } from "@phena/schema";
import { AUTH_COOKIE_NAME } from "@phena/schema";
import { hc, parseResponse } from "hono/client";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { cache } from "react";
import { API_BASE_URL, type AppWithErrors } from "@/lib/api-client";

const getToken = async () => (await cookies()).get(AUTH_COOKIE_NAME)?.value;

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = await getToken();
  if (!token) {
    return fetch(input, init);
  }

  const headers = new Headers(init?.headers);
  headers.set("Cookie", `${AUTH_COOKIE_NAME}=${token}`);
  return fetch(input, { ...init, headers });
};

const serverClient = hc<AppWithErrors>(API_BASE_URL, {
  fetch: customFetch,
});

export const verifySession = cache(async (): Promise<TeamResponse | null> => {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    const { team } = await parseResponse(serverClient.api.auth.me.$get());
    return team;
  } catch {
    return null;
  }
});

export async function requireRole(loginPath: string, ...roles: Role[]): Promise<TeamResponse> {
  const session = await verifySession();
  if (!session) {
    redirect(loginPath);
  }

  if (!roles.includes(session.role)) {
    forbidden();
  }

  return session;
}
