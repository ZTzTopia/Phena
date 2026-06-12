"use client";

import { Button } from "@phena/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/card";
import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { toast } from "sonner";
import { type ZodType } from "zod/v4";
import {
  type ConfigPatch,
  useConfigMutation,
} from "@/app/(admin)/admin/config/_hooks/use-config-mutation";

type FieldErrors = Record<string, string>;

interface ConfigCardRenderProps<TDraft> {
  draft: TDraft;
  setDraft: Dispatch<SetStateAction<TDraft>>;
  getFieldError: (field: string) => string | undefined;
  getFieldErrors: (field: string) => Array<{ message: string }> | undefined;
}

interface ConfigCardProps<TDraft> {
  title: string;
  description: string;
  icon?: ReactNode;
  initialValue: TDraft;
  schema: ZodType<TDraft>;
  toPatch: (draft: TDraft) => ConfigPatch;
  successMessage: string;
  children: (props: ConfigCardRenderProps<TDraft>) => ReactNode;
}

export function ConfigCard<TDraft>({
  title,
  description,
  icon,
  initialValue,
  schema,
  toPatch,
  successMessage,
  children,
}: ConfigCardProps<TDraft>) {
  const [draft, setDraft] = useState<TDraft>(initialValue);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const configMutation = useConfigMutation();

  const isDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(initialValue);
  }, [draft, initialValue]);

  const getFieldError = (field: string) => fieldErrors[field];
  const getFieldErrors = (field: string) => {
    const message = getFieldError(field);
    return message ? [{ message }] : undefined;
  };

  const handleSave = async () => {
    const result = schema.safeParse(draft);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        errors[issue.path.join(".")] = issue.message;
      }
      setFieldErrors(errors);
      toast.error("Please fix validation errors before saving");
      return;
    }

    setFieldErrors({});

    try {
      await configMutation.mutateAsync({
        patch: toPatch(result.data),
      });
      toast.success(successMessage);
    } catch (error) {
      // if (error instanceof ApiError) {
      //   const validationErrors = error.getValidationErrors();
      //   if (validationErrors && validationErrors.length > 0) {
      //     const errors: FieldErrors = {};
      //     for (const validationError of validationErrors) {
      //       const fieldPath = validationError.path.slice(1).join(".");
      //       if (fieldPath) {
      //         errors[fieldPath] = validationError.message;
      //       }
      //     }
      //     setFieldErrors(errors);
      //   }

      //   toast.error(error.appError.message || "Failed to save configuration");
      //   return;
      // }

      toast.error(error instanceof Error ? error.message : "Failed to save configuration");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {children({ draft, setDraft, getFieldError, getFieldErrors })}
        <div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || configMutation.isPending}
          >
            {configMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
