"use client";

import { ChallengeModel as challengeModel } from "@phena/schema";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import type { ChallengeResponse, ChallengeFormInput } from "../_types";

export interface UseChallengeFormOptions {
  defaultValues?: Partial<ChallengeResponse>;
  mode?: "create" | "update";
  onSubmit?: (data: ChallengeFormInput) => void;
}

const defaultValues: ChallengeFormInput = {
  title: "",
  description: "",
  category: undefined,
  numFlags: 1,
  releaseRound: 1,
  file: null,
};

export function useChallengeForm(options: UseChallengeFormOptions = {}) {
  const mode = options.mode ?? "create";
  const schema =
    mode === "create" ? challengeModel.createChallenge : challengeModel.updateChallenge;

  const form = useForm({
    defaultValues: options.defaultValues ?? defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      options.onSubmit?.(value as ChallengeFormInput);
    },
    onSubmitInvalid: async (props) => {
      console.error(props);
      toast.error("Form validation failed");
    },
  });

  return { form };
}
