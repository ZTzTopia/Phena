"use client";

import type { AppType } from "@api/index";
import { AUTH_COOKIE_NAME } from "@phena/schema";
import { hc, type ApplyGlobalResponse } from "hono/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/";

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await fetch(input, { ...init, credentials: "include" });
  if (res.status !== 401) {
    return res;
  }

  if (input.toString().includes("/api/auth/")) {
    return res;
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  window.location.href = "/";
  return res;
};

type AppWithErrors = ApplyGlobalResponse<
  AppType,
  {
    400: { json: { error: string } };
    401: { json: { error: string } };
    500: { json: { error: string } };
  }
>;

export const client = hc<AppWithErrors>(API_BASE_URL, {
  fetch: customFetch,
});
