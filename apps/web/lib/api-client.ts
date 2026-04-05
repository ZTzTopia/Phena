"use client";

import type { AppType } from "@api/index";
import { hc, type ApplyGlobalResponse } from "hono/client";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "/";

const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
};

type AppWithErrors = ApplyGlobalResponse<
  AppType,
  {
    400: { json: { error: string } };
    401: { json: { error: string } };
    500: { json: { error: string } };
  }
>;

export const client = hc<AppWithErrors>(baseUrl, {
  fetch: customFetch,
});
