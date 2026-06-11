"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@phena/ui/components/alert-dialog";
import { Input } from "@phena/ui/components/input";
import { cn } from "@phena/ui/lib/utils";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  requiredInput?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "default",
  requiredInput,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const isDisabled = requiredInput ? inputValue !== requiredInput : false;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setInputValue("");
        }
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {requiredInput && (
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">
              Type <span className="font-mono font-bold">{requiredInput}</span> to confirm:
            </label>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={requiredInput}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) {
                setInputValue("");
                onConfirm();
              }
            }}
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              isDisabled && "pointer-events-none opacity-50",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
