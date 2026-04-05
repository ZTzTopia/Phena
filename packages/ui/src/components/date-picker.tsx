"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@phena/ui/components/button";
import { Calendar } from "@phena/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@phena/ui/components/popover";
import { cn } from "@phena/ui/lib/utils";
import { TimePicker } from "./time-picker";

type DatePickerMode = "date" | "date-time";

export type DatePickerProps = {
  value?: Date | string;
  onValueChange?: (value: Date | undefined) => void;
  mode?: DatePickerMode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  use12HourFormat?: boolean;
  showSeconds?: boolean;
  captionLayout?: "label" | "dropdown";
  "aria-invalid"?: boolean;
};

const toDate = (value?: Date | string): Date | undefined => {
  if (!value) return undefined;
  const parsed = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const toTimeValue = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const withTime = (date: Date, timeValue: string): Date => {
  const [hoursRaw, minutesRaw, secondsRaw] = timeValue.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw || "0");

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return date;
  }

  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, seconds, 0);
  return nextDate;
};

function DatePicker({
  value,
  onValueChange,
  mode = "date",
  placeholder = "Pick a date",
  disabled,
  className,
  buttonClassName,
  use12HourFormat = false,
  showSeconds = false,
  captionLayout = "label",
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => toDate(value), [value]);

  const handleSelect = (nextDate?: Date) => {
    if (!nextDate) {
      onValueChange?.(undefined);
      return;
    }

    if (mode === "date-time" && selectedDate) {
      onValueChange?.(withTime(nextDate, toTimeValue(selectedDate)));
      return;
    }

    onValueChange?.(nextDate);
    if (mode === "date") {
      setOpen(false);
    }
  };

  const handleTimeChange = (timeValue: string) => {
    const baseDate = selectedDate ?? new Date();
    onValueChange?.(withTime(baseDate, timeValue));
  };

  const displayText = React.useMemo(() => {
    if (!selectedDate) return placeholder;
    if (mode === "date-time") {
      return format(selectedDate, "PPP p");
    }
    return format(selectedDate, "PPP");
  }, [selectedDate, placeholder, mode]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!selectedDate}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            buttonClassName,
          )}
        >
          <CalendarIcon data-icon="inline-start" className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", className)}>
        <div className="flex flex-col gap-3 p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            captionLayout={captionLayout}
            initialFocus
          />

          {mode === "date-time" && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Time
                </span>
                <TimePicker
                  value={selectedDate ? toTimeValue(selectedDate) : "12:00:00"}
                  onValueChange={handleTimeChange}
                  use12HourFormat={use12HourFormat}
                  showSeconds={showSeconds}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
