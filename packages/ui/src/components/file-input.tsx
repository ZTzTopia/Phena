"use client";

import { Button } from "@phena/ui/components/button";
import { Field, FieldLabel } from "@phena/ui/components/field";
import { cn } from "@phena/ui/lib/utils";
import { UploadCloudIcon, XIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface FileInputProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = {
  "application/zip": [".zip"],
  "application/x-tar": [".tar", ".tar.gz", ".tgz"],
  "application/gzip": [".gz"],
};

const ACCEPTED_EXTENSIONS = [".zip", ".tar", ".tar.gz", ".tgz"];

export function FileInput({
  value,
  onChange,
  label = "File",
  disabled = false,
  className,
}: FileInputProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onChange(file);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    disabled,
    multiple: false,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Field className={className}>
      <FieldLabel htmlFor="file-input">{label}</FieldLabel>
      <div
        {...getRootProps()}
        data-slot="field"
        className={cn(
          "relative flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-border bg-input/30 px-4 py-6 transition-colors",
          "hover:border-muted-foreground/50 hover:bg-input/40",
          isDragActive && !isDragReject && "border-primary bg-primary/5",
          isDragReject && "border-destructive bg-destructive/5",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps()} id="file-input" />
        {value ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="max-w-[200px] truncate text-xs font-medium">{value.name}</p>
            <p className="text-muted-foreground text-xs">{(value.size / 1024).toFixed(1)} KB</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="mt-1"
            >
              <XIcon className="mr-1 size-3" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <UploadCloudIcon
              className={cn("size-10 text-muted-foreground", isDragActive && "text-primary")}
            />
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-xs">
                {isDragActive ? (
                  <span className="text-primary">Drop the file here</span>
                ) : (
                  <>
                    <span className="text-primary font-medium">Click to upload</span>
                    {" or drag and drop"}
                  </>
                )}
              </p>
              <p className="text-muted-foreground text-xs">{ACCEPTED_EXTENSIONS.join(", ")}</p>
            </div>
          </>
        )}
      </div>
    </Field>
  );
}
