"use client";

import { ConfigKey, ConfigModel } from "@phena/schema";
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

export function ContestConfigCard({
  initialValue,
}: {
  initialValue: {
    name: string;
    tickDuration: number;
    tickPerRound: number;
    totalRounds: number;
    startDate: string;
  };
}) {
  return (
    <ConfigCard
      title="Contest Settings"
      icon={<TrophyIcon className="size-5" />}
      description="Configure contest name, timing, and duration"
      initialValue={initialValue}
      schema={ConfigModel.contestSection}
      toPatch={(contest) => ({
        contest: {
          [ConfigKey.ContestName]: contest.name,
          [ConfigKey.TickDuration]: contest.tickDuration,
          [ConfigKey.TickPerRound]: contest.tickPerRound,
          [ConfigKey.TotalRounds]: contest.totalRounds,
          [ConfigKey.StartDate]: contest.startDate,
        },
      })}
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

          <Field data-invalid={Boolean(getFieldError("tickPerRound")) || undefined}>
            <FieldLabel htmlFor="tick-per-round">Ticks Per Round</FieldLabel>
            <NumberInput
              id="tick-per-round"
              min={1}
              max={100}
              step={1}
              value={draft.tickPerRound}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, tickPerRound: value ?? 0 }))
              }
              endAddon="ticks"
              aria-invalid={Boolean(getFieldError("tickPerRound")) || undefined}
            />
            <FieldDescription>Number of ticks per round.</FieldDescription>
            <FieldError errors={getFieldErrors("tickPerRound")} />
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

          <Field data-invalid={Boolean(getFieldError("totalRounds")) || undefined}>
            <FieldLabel htmlFor="total-rounds">Total Rounds</FieldLabel>
            <NumberInput
              id="total-rounds"
              min={1}
              max={100}
              step={1}
              value={draft.totalRounds}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, totalRounds: value ?? 0 }))
              }
              aria-invalid={Boolean(getFieldError("totalRounds")) || undefined}
            />
            <FieldDescription>Maximum number of rounds before the contest ends.</FieldDescription>
            <FieldError errors={getFieldErrors("totalRounds")} />
          </Field>
        </FieldGroup>
      )}
    </ConfigCard>
  );
}
