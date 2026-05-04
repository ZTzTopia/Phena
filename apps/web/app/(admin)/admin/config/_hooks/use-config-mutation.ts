"use client";

import { ConfigKey } from "@phena/schema";
import { parseResponse } from "hono/client";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@/lib/api-client";

type ConfigPatch = Partial<{
  contest: Record<string, unknown>;
  scoring: Record<string, unknown>;
  system: Record<string, unknown>;
  battleMap: Record<string, unknown>;
}>;

interface ConfigMutationVariables {
  patch: ConfigPatch;
}

interface ConfigMutationResponse {
  success: boolean;
  updated: ConfigPatch;
}

export function useConfigMutation(): UseMutationResult<
  ConfigMutationResponse,
  Error,
  ConfigMutationVariables,
  unknown
> {
  const queryClient = useQueryClient();
  const validKeys = new Set(Object.values(ConfigKey));

  return useMutation<ConfigMutationResponse, Error, ConfigMutationVariables, unknown>({
    mutationFn: async ({ patch }) => {
      const updates = Object.entries(patch).flatMap(([, values]) =>
        Object.entries(values as Record<string, unknown>).map(([k, value]) => {
          const key = validKeys.has(k as ConfigKey) ? (k as ConfigKey) : null;
          if (key === null) {
            throw new Error(`Invalid config key: ${k}`);
          }
          return { key, value: String(value) };
        }),
      );

      await Promise.all(
        updates.map(({ key, value }) =>
          parseResponse(
            client.api.config[":key"].$put({
              param: { key },
              json: { value },
            }),
          ),
        ),
      );

      await parseResponse(client.api.config.$get());

      return {
        success: true,
        updated: patch,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
      toast.success("Configuration saved");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save configuration");
    },
  });
}
