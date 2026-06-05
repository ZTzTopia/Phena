"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@phena/ui/components/input-group";
import { MinusIcon, PlusIcon } from "lucide-react";
import * as React from "react";

export type NumberInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  allowEmpty?: boolean;
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
};

const EPSILON = 1e-9;

const formatValue = (value?: number): string => {
  if (value === undefined || !Number.isFinite(value)) {
    return "";
  }
  return String(value);
};

const clamp = (value: number, min?: number, max?: number): number => {
  let next = value;
  if (min !== undefined) {
    next = Math.max(next, min);
  }
  if (max !== undefined) {
    next = Math.min(next, max);
  }
  return next;
};

const isStepAligned = (value: number, step: number, min?: number): boolean => {
  const base = min ?? 0;
  const diff = (value - base) / step;
  return Math.abs(diff - Math.round(diff)) < EPSILON;
};

const validateNumberInputValue = (
  raw: string,
  {
    min,
    max,
    step,
    allowEmpty,
  }: { min?: number; max?: number; step?: number; allowEmpty: boolean },
): { value: number | undefined; valid: boolean } => {
  if (raw.trim() === "") {
    return { value: undefined, valid: allowEmpty };
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return { value: undefined, valid: false };
  }

  if (min !== undefined && parsed < min) {
    return { value: parsed, valid: false };
  }

  if (max !== undefined && parsed > max) {
    return { value: parsed, valid: false };
  }

  if (step !== undefined && step > 0 && !isStepAligned(parsed, step, min)) {
    return { value: parsed, valid: false };
  }

  return { value: parsed, valid: true };
};

function NumberInput({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  allowEmpty = false,
  startAddon,
  endAddon,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  ...props
}: NumberInputProps) {
  const [rawValue, setRawValue] = React.useState(formatValue(value));
  const [hasValidationError, setHasValidationError] = React.useState(false);

  React.useEffect(() => {
    const nextValue = formatValue(value);
    setRawValue((prev) => (prev === nextValue ? prev : nextValue));
  }, [value]);

  const commitValue = React.useCallback(
    (nextRawValue: string) => {
      const result = validateNumberInputValue(nextRawValue, {
        min,
        max,
        step,
        allowEmpty,
      });

      setHasValidationError(!result.valid);
      onValueChange?.(result.value);
    },
    [allowEmpty, max, min, onValueChange, step],
  );

  const increment = () => {
    if (disabled) return;
    const current = Number(rawValue);
    const base = Number.isFinite(current) ? current : (min ?? 0);
    const next = clamp(base + step, min, max);
    const nextRawValue = String(next);
    setRawValue(nextRawValue);
    commitValue(nextRawValue);
  };

  const decrement = () => {
    if (disabled) return;
    const current = Number(rawValue);
    const base = Number.isFinite(current) ? current : (min ?? 0);
    const next = clamp(base - step, min, max);
    const nextRawValue = String(next);
    setRawValue(nextRawValue);
    commitValue(nextRawValue);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextRawValue = event.target.value;
    setRawValue(nextRawValue);
    commitValue(nextRawValue);
  };

  const handleBlur = () => {
    const result = validateNumberInputValue(rawValue, {
      min,
      max,
      step,
      allowEmpty,
    });

    if (result.valid && result.value !== undefined) {
      const normalizedValue = String(clamp(result.value, min, max));
      setRawValue(normalizedValue);
      onValueChange?.(Number(normalizedValue));
      return;
    }

    if (result.valid && result.value === undefined) {
      setRawValue("");
      onValueChange?.(undefined);
    }
  };

  return (
    <InputGroup data-disabled={disabled || undefined}>
      {startAddon ? <InputGroupAddon align="inline-start">{startAddon}</InputGroupAddon> : null}

      <InputGroupButton
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        onClick={decrement}
        aria-label="Decrement value"
      >
        <MinusIcon data-icon="inline-start" />
      </InputGroupButton>

      <InputGroupInput
        type="text"
        inputMode={step % 1 === 0 ? "numeric" : "decimal"}
        value={rawValue}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={ariaInvalid || hasValidationError || undefined}
        disabled={disabled}
        className={className}
        {...props}
      />

      <InputGroupButton
        type="button"
        variant="ghost"
        size="icon-xs"
        disabled={disabled}
        onClick={increment}
        aria-label="Increment value"
      >
        <PlusIcon data-icon="inline-end" />
      </InputGroupButton>

      {endAddon ? <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon> : null}
    </InputGroup>
  );
}

export { NumberInput };
export { clamp, validateNumberInputValue };
