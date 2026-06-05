"use client";

import { ConfigKeySchema } from "@phena/schema";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { toast } from "sonner";
import { client } from "@/lib/api-client";

export interface ConfigPatch {
  [section: string]: Partial<Record<string, string | number | boolean | null>>;
}

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

  return useMutation<ConfigMutationResponse, Error, ConfigMutationVariables, unknown>({
    mutationFn: async ({ patch }) => {
      const updates = Object.entries(patch).flatMap(([, values]) => {
        if (!values) return [];
        return Object.entries(values).flatMap(([k, value]) => {
          if (value === null || value === undefined) return [];
          const parsed = ConfigKeySchema.safeParse(k);
          if (!parsed.success) return [];
          return [{ key: parsed.data, value: String(value) }];
        });
      });

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
