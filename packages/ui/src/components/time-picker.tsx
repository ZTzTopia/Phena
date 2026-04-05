"use client";

import * as React from "react";
import { Clock } from "lucide-react";

import { Button } from "@phena/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@phena/ui/components/popover";
import { cn } from "@phena/ui/lib/utils";

export type TimePickerProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  use12HourFormat?: boolean;
  showSeconds?: boolean;
  "aria-invalid"?: boolean;
};

function formatTimeDisplay(
  hours: number,
  minutes: number,
  seconds: number,
  use12Hour: boolean,
): string {
  if (use12Hour) {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}${seconds > 0 ? `:${String(seconds).padStart(2, "0")}` : ""} ${period}`;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}${
    seconds > 0 ? `:${String(seconds).padStart(2, "0")}` : ""
  }`;
}

function parseTimeValue(value: string): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const parts = value.split(":");
  return {
    hours: Number.parseInt(parts[0] || "0", 10),
    minutes: Number.parseInt(parts[1] || "0", 10),
    seconds: Number.parseInt(parts[2] || "0", 10),
  };
}

export function TimePicker({
  value,
  onValueChange,
  placeholder = "Pick a time",
  disabled,
  className,
  buttonClassName,
  use12HourFormat = false,
  showSeconds = false,
  "aria-invalid": ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const { hours, minutes, seconds } = React.useMemo(
    () =>
      value ? parseTimeValue(value) : { hours: 12, minutes: 0, seconds: 0 },
    [value],
  );

  const handleHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(23, newHours));
    onValueChange?.(
      `${String(validHours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`,
    );
  };

  const handleMinutesChange = (newMinutes: number) => {
    const validMinutes = Math.max(0, Math.min(59, newMinutes));
    onValueChange?.(
      `${String(hours).padStart(2, "0")}:${String(validMinutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`,
    );
  };

  const handleSecondsChange = (newSeconds: number) => {
    const validSeconds = Math.max(0, Math.min(59, newSeconds));
    onValueChange?.(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(validSeconds).padStart(2, "0")}`,
    );
  };

  const handlePeriodChange = (period: "AM" | "PM") => {
    let newHours = hours;
    if (period === "AM" && hours >= 12) {
      newHours = hours - 12;
    } else if (period === "PM" && hours < 12) {
      newHours = hours + 12;
    }
    onValueChange?.(
      `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
      )}:${String(seconds).padStart(2, "0")}`,
    );
  };

  const displayText = React.useMemo(() => {
    if (!value) return placeholder;
    return formatTimeDisplay(hours, minutes, seconds, use12HourFormat);
  }, [value, hours, minutes, seconds, use12HourFormat, placeholder]);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = use12HourFormat
    ? hours === 0
      ? 12
      : hours > 12
        ? hours - 12
        : hours
    : hours;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!value}
          className={cn(
            "justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            buttonClassName,
          )}
        >
          <Clock data-icon="inline-start" className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-3", className)}>
        <div className="flex items-center gap-2">
          {/* Hours */}
          <div className="flex flex-col items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-12"
              onClick={() =>
                handleHoursChange(
                  use12HourFormat ? (displayHours % 12) + 1 : (hours + 1) % 24,
                )
              }
            >
              +
            </Button>
            <div className="flex h-10 w-12 items-center justify-center border text-lg font-semibold">
              {String(displayHours).padStart(2, "0")}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-12"
              onClick={() =>
                handleHoursChange(
                  use12HourFormat
                    ? displayHours === 1
                      ? 12
                      : displayHours - 1
                    : hours === 0
                      ? 23
                      : hours - 1,
                )
              }
            >
              -
            </Button>
          </div>

          <span className="text-2xl font-semibold text-muted-foreground">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-12"
              onClick={() => handleMinutesChange((minutes + 1) % 60)}
            >
              +
            </Button>
            <div className="flex h-10 w-12 items-center justify-center border text-lg font-semibold">
              {String(minutes).padStart(2, "0")}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-12"
              onClick={() =>
                handleMinutesChange(minutes === 0 ? 59 : minutes - 1)
              }
            >
              -
            </Button>
          </div>

          {showSeconds && (
            <>
              <span className="text-2xl font-semibold text-muted-foreground">
                :
              </span>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12"
                  onClick={() => handleSecondsChange((seconds + 1) % 60)}
                >
                  +
                </Button>
                <div className="flex h-10 w-12 items-center justify-center border text-lg font-semibold">
                  {String(seconds).padStart(2, "0")}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-12"
                  onClick={() =>
                    handleSecondsChange(seconds === 0 ? 59 : seconds - 1)
                  }
                >
                  -
                </Button>
              </div>
            </>
          )}

          {use12HourFormat && (
            <div className="flex flex-col gap-1 ml-2">
              <Button
                type="button"
                variant={period === "AM" ? "default" : "outline"}
                size="sm"
                className="h-8 w-14"
                onClick={() => handlePeriodChange("AM")}
              >
                AM
              </Button>
              <Button
                type="button"
                variant={period === "PM" ? "default" : "outline"}
                size="sm"
                className="h-8 w-14"
                onClick={() => handlePeriodChange("PM")}
              >
                PM
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
