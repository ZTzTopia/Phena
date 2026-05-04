"use client";

import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useDeferredValue } from "react";
import { client } from "@/lib/api-client";

export interface FlagPreviewContext {
  round: number;
  tick: number;
  challengeId: number;
  teamId: number;
  serviceId: number;
  index: number;
}

export interface FlagPreviewSample {
  context: FlagPreviewContext;
  result: string;
}

export interface FlagPreviewResponse {
  samples: FlagPreviewSample[];
}

export function useFlagPreview(template: string, enabled: boolean = true) {
  const deferred = useDeferredValue(template);

  return useQuery({
    queryKey: ["flag-preview", deferred],
    queryFn: async () => {
      const res = await parseResponse(
        client.api.config["flag-preview"].$post({
          json: { template: deferred },
        }),
      );
      return res as FlagPreviewResponse;
    },
    enabled: enabled && deferred.length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    meta: { skipGlobalError: true },
  });
}