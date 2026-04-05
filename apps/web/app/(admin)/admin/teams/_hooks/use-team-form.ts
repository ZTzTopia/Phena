"use client";

import { TeamModel } from "@phena/schema";
import { useForm } from "@tanstack/react-form";
import type { TeamForm } from "../_types";

export interface UseTeamFormOptions {
  defaultValues?: Partial<TeamForm>;
  onSubmit?: (data: TeamModel["createTeam"] | TeamModel["updateTeam"]) => void;
}

const defaultValues = {
  name: "",
  password: "",
} as const;

export function useTeamForm(options: UseTeamFormOptions = {}) {
  const isUpdating = !!options.defaultValues;
  const form = useForm({
    defaultValues: options.defaultValues ?? defaultValues,
    validators: {
      onSubmit: isUpdating ? TeamModel.updateTeam : TeamModel.createTeam.safeParse,
    },
    onSubmit: async ({ value }) => {
      options.onSubmit?.(value);
    },
    onSubmitInvalid: (props) => {
      console.error(props);
    },
  });

  return { form };
}
