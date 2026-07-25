"use client";

import type { AuthModel as AuthModelType } from "@phena/schema";
import { AuthModel } from "@phena/schema";
import { useForm } from "@tanstack/react-form";

type Login = AuthModelType["login"];

export interface UseLoginFormOptions {
  defaultValues?: Partial<Login>;
  onSubmit?: (data: Login) => void | Promise<void>;
}

export function useLoginForm(options: UseLoginFormOptions = {}) {
  const form = useForm({
    defaultValues: {
      name: "",
      password: "",
      ...options.defaultValues,
    },
    validators: {
      onSubmit: AuthModel.login,
    },
    onSubmit: async ({ value }) => {
      options.onSubmit?.(value);
    },
  });

  return { form, setFieldValue: form.setFieldValue };
}
