"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

type Config = {
  contest: Record<string, unknown>;
  scoring: Record<string, unknown>;
  system: Record<string, unknown>;
  battleMap: Record<string, unknown>;
};

type ConfigPatch = Partial<Config>;

type ConfigQueryData = { config: Config };

interface ConfigMutationVariables {
  patch: ConfigPatch;
}

interface ConfigMutationResponse {
  success: boolean;
  config: Config;
  updated: ConfigPatch;
}

export function useConfigMutation(): UseMutationResult<
  ConfigMutationResponse,
  Error,
  ConfigMutationVariables,
  unknown
> {
  return useMutation<ConfigMutationResponse, Error, ConfigMutationVariables, unknown>({
    mutationFn: async ({ patch }) => {
      await new Promise((r) => setTimeout(r, 500));
      return {
        success: true,
        config: patch as Config,
        updated: patch,
      };
    },
    onSuccess: () => {
      toast.success("Config updated (mock)");
    },
    onError: () => {
      toast.error("Failed to update config (mock)");
    },
  });
}
