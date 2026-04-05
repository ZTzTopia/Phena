"use client";

/* eslint-disable react/no-children-prop */
import { Button } from "@phena/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@phena/ui/components/field";
import { FileInput } from "@phena/ui/components/file-input";
import { Input } from "@phena/ui/components/input";
import { NumberInput } from "@phena/ui/components/number-input";
import { useChallengeForm } from "@/app/(admin)/admin/challenges/_hooks/use-challenge-form";
import type { ChallengeFormInput, ChallengeResponse } from "../_types";

interface ChallengeFormProps {
  defaultValues?: ChallengeResponse | null;
  mode?: "create" | "update";
  onSubmit: (data: ChallengeFormInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ChallengeForm({
  defaultValues,
  mode = "create",
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Submit",
}: ChallengeFormProps) {
  const { form } = useChallengeForm({
    defaultValues: defaultValues ?? undefined,
    mode,
    onSubmit,
  });

  const isUpdateMode = mode === "update";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <FieldGroup>
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Challenge Title"
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input
                  id="description"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Challenge description"
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="flex flex-col gap-2">
          <form.Field
            name="file"
            children={(field) => (
              <FileInput
                value={field.state.value}
                onChange={field.handleChange}
                label={isUpdateMode ? "Replace File" : "Challenge File"}
              />
            )}
          />

          {isUpdateMode && defaultValues?.filePath && (
            <div className="bg-muted/30 flex items-center gap-2 border px-4 py-3 text-xs">
              <span className="font-medium">Current file:</span>
              <span>{defaultValues.filePath.split("/").pop()}</span>
              {defaultValues.fileHash && (
                <span className="text-muted-foreground">({defaultValues.fileHash})</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="numFlags"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="numFlags">Number of Flags</FieldLabel>
                  <NumberInput
                    id="numFlags"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(val) => field.handleChange(val)}
                    min={1}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="releaseRound"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="releaseRound">Release Round</FieldLabel>
                  <NumberInput
                    id="releaseRound"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(val) => field.handleChange(val)}
                    min={1}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
