"use client";

import { DatePicker } from "@phena/ui/components/date-picker";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@phena/ui/components/field";
import { Input } from "@phena/ui/components/input";
import { NumberInput } from "@phena/ui/components/number-input";
import { TrophyIcon } from "lucide-react";
import { ConfigCard } from "@/app/(admin)/admin/config/_components/config-card";

interface ContestConfigCardProps {
  initialValue: {
    name: string;
    tickDuration: number;
    roundDuration: number;
    startDate: string;
    endDate: string;
  };
}

export function ContestConfigCard({ initialValue }: ContestConfigCardProps) {
  return (
    <ConfigCard
      title="Contest Settings"
      icon={<TrophyIcon className="size-5" />}
      description="Configure contest name, timing, and duration"
      initialValue={initialValue}
      schema={{} as any}
      toPatch={(contest) => ({ contest })}
      successMessage="Contest settings saved"
    >
      {({ draft, setDraft, getFieldError, getFieldErrors }) => (
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field data-invalid={Boolean(getFieldError("name")) || undefined}>
            <FieldLabel htmlFor="contest-name">Contest Name</FieldLabel>
            <Input
              id="contest-name"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              aria-invalid={Boolean(getFieldError("name")) || undefined}
            />
            <FieldDescription>Name shown across the platform.</FieldDescription>
            <FieldError errors={getFieldErrors("name")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("tickDuration")) || undefined}>
            <FieldLabel htmlFor="tick-duration">Tick Duration</FieldLabel>
            <NumberInput
              id="tick-duration"
              min={30}
              max={600}
              step={1}
              value={draft.tickDuration}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, tickDuration: value ?? 0 }))}
              endAddon="seconds"
              aria-invalid={Boolean(getFieldError("tickDuration")) || undefined}
            />
            <FieldDescription>Interval between scoring ticks.</FieldDescription>
            <FieldError errors={getFieldErrors("tickDuration")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("roundDuration")) || undefined}>
            <FieldLabel htmlFor="round-duration">Round Duration</FieldLabel>
            <NumberInput
              id="round-duration"
              min={300}
              max={3600}
              step={1}
              value={draft.roundDuration}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, roundDuration: value ?? 0 }))
              }
              endAddon="seconds"
              aria-invalid={Boolean(getFieldError("roundDuration")) || undefined}
            />
            <FieldDescription>How long each round runs.</FieldDescription>
            <FieldError errors={getFieldErrors("roundDuration")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("startDate")) || undefined}>
            <FieldLabel htmlFor="start-date">Start Date</FieldLabel>
            <DatePicker
              value={draft.startDate}
              mode="date-time"
              showSeconds={true}
              onValueChange={(value) => {
                if (!value) return;
                setDraft((prev) => ({ ...prev, startDate: value.toISOString() }));
              }}
              aria-invalid={Boolean(getFieldError("startDate")) || undefined}
            />
            <FieldDescription>Contest start date and time (ISO saved).</FieldDescription>
            <FieldError errors={getFieldErrors("startDate")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("endDate")) || undefined}>
            <FieldLabel htmlFor="end-date">End Date</FieldLabel>
            <DatePicker
              value={draft.endDate}
              mode="date-time"
              showSeconds={true}
              onValueChange={(value) => {
                if (!value) return;
                setDraft((prev) => ({ ...prev, endDate: value.toISOString() }));
              }}
              aria-invalid={Boolean(getFieldError("endDate")) || undefined}
            />
            <FieldDescription>Contest end date and time (ISO saved).</FieldDescription>
            <FieldError errors={getFieldErrors("endDate")} />
          </Field>
        </FieldGroup>
      )}
    </ConfigCard>
  );
}
