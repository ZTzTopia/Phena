"use client";

import type { AuthModel } from "@phena/schema";
import { AuthModel as authModel } from "@phena/schema";
import { useForm } from "@tanstack/react-form";

type Login = AuthModel["login"];

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
      onSubmit: authModel.login,
    },
    onSubmit: async ({ value }) => {
      options.onSubmit?.(value);
    },
  });

  return { form, setFieldValue: form.setFieldValue };
}
