"use client";

import { ConfigKey, ConfigModel } from "@phena/schema";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@phena/ui/components/field";
import { NumberInput } from "@phena/ui/components/number-input";
import { CogIcon } from "lucide-react";
import { ConfigCard } from "@/app/(admin)/admin/config/_components/config-card";

export function SystemConfigCard({
  initialValue,
}: {
  initialValue: {
    checkerPoolSize: number;
    checkerTimeout: number;
    flagTemplate: string;
  };
}) {
  return (
    <ConfigCard
      title="System Constraints"
      icon={<CogIcon className="size-5" />}
      description="Configure checker and flag parameters"
      initialValue={initialValue}
      schema={ConfigModel.systemSection}
      toPatch={(system) => ({
        system: {
          [ConfigKey.CheckerPoolSize]: system.checkerPoolSize,
          [ConfigKey.CheckerTimeout]: system.checkerTimeout,
          [ConfigKey.FlagTemplate]: system.flagTemplate,
        },
      })}
      successMessage="System constraints saved"
    >
      {({ draft, setDraft, getFieldError, getFieldErrors }) => (
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field data-invalid={Boolean(getFieldError("checkerPoolSize")) || undefined}>
            <FieldLabel htmlFor="checker-pool-size">Checker Pool Size</FieldLabel>
            <NumberInput
              id="checker-pool-size"
              min={1}
              max={100}
              step={1}
              value={draft.checkerPoolSize}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, checkerPoolSize: value ?? 0 }))
              }
              endAddon="workers"
              aria-invalid={Boolean(getFieldError("checkerPoolSize")) || undefined}
            />
            <FieldDescription>Concurrent checker worker pool size.</FieldDescription>
            <FieldError errors={getFieldErrors("checkerPoolSize")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("checkerTimeout")) || undefined}>
            <FieldLabel htmlFor="checker-timeout">Checker Timeout</FieldLabel>
            <NumberInput
              id="checker-timeout"
              min={5}
              max={300}
              step={1}
              value={draft.checkerTimeout}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, checkerTimeout: value ?? 0 }))
              }
              endAddon="seconds"
              aria-invalid={Boolean(getFieldError("checkerTimeout")) || undefined}
            />
            <FieldDescription>Maximum execution time per checker run.</FieldDescription>
            <FieldError errors={getFieldErrors("checkerTimeout")} />
          </Field>
        </FieldGroup>
      )}
    </ConfigCard>
  );
}
