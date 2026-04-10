"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@phena/ui/components/field";
import { NumberInput } from "@phena/ui/components/number-input";
import { SettingsIcon } from "lucide-react";
import { ConfigCard } from "@/app/(admin)/admin/config/_components/config-card";

interface ScoringConfigCardProps {
  initialValue: {
    attackPoints: number;
    defensePoints: number;
    slaWeight: number;
    firstBloodBonus: number | null;
  };
}

export function ScoringConfigCard({ initialValue }: ScoringConfigCardProps) {
  return (
    <ConfigCard
      title="Scoring Parameters"
      icon={<SettingsIcon className="size-5" />}
      description="Configure points and scoring weights"
      initialValue={initialValue}
      schema={{} as any}
      toPatch={(scoring) => ({ scoring })}
      successMessage="Scoring parameters saved"
    >
      {({ draft, setDraft, getFieldError, getFieldErrors }) => (
        <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field data-invalid={Boolean(getFieldError("attackPoints")) || undefined}>
            <FieldLabel htmlFor="attack-points">Attack Points</FieldLabel>
            <NumberInput
              id="attack-points"
              min={1}
              step={1}
              value={draft.attackPoints}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, attackPoints: value ?? 0 }))}
              endAddon="pts"
              aria-invalid={Boolean(getFieldError("attackPoints")) || undefined}
            />
            <FieldDescription>Points awarded for successful attacks.</FieldDescription>
            <FieldError errors={getFieldErrors("attackPoints")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("defensePoints")) || undefined}>
            <FieldLabel htmlFor="defense-points">Defense Points</FieldLabel>
            <NumberInput
              id="defense-points"
              min={1}
              step={1}
              value={draft.defensePoints}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, defensePoints: value ?? 0 }))
              }
              endAddon="pts"
              aria-invalid={Boolean(getFieldError("defensePoints")) || undefined}
            />
            <FieldDescription>Points awarded for successful defenses.</FieldDescription>
            <FieldError errors={getFieldErrors("defensePoints")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("slaWeight")) || undefined}>
            <FieldLabel htmlFor="sla-weight">SLA Weight</FieldLabel>
            <NumberInput
              id="sla-weight"
              min={0}
              max={1}
              step={0.01}
              value={draft.slaWeight}
              onValueChange={(value) => setDraft((prev) => ({ ...prev, slaWeight: value ?? 0 }))}
              endAddon="0-1"
              aria-invalid={Boolean(getFieldError("slaWeight")) || undefined}
            />
            <FieldDescription>Weight factor for service availability.</FieldDescription>
            <FieldError errors={getFieldErrors("slaWeight")} />
          </Field>

          <Field data-invalid={Boolean(getFieldError("firstBloodBonus")) || undefined}>
            <FieldLabel htmlFor="first-blood-bonus">First Blood Bonus</FieldLabel>
            <NumberInput
              id="first-blood-bonus"
              min={0}
              step={1}
              allowEmpty
              value={draft.firstBloodBonus ?? undefined}
              onValueChange={(value) =>
                setDraft((prev) => ({ ...prev, firstBloodBonus: value ?? null }))
              }
              endAddon="pts"
              aria-invalid={Boolean(getFieldError("firstBloodBonus")) || undefined}
            />
            <FieldDescription>Optional bonus for first valid exploit.</FieldDescription>
            <FieldError errors={getFieldErrors("firstBloodBonus")} />
          </Field>
        </FieldGroup>
      )}
    </ConfigCard>
  );
}
