"use client";

import { Button } from "@phena/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@phena/ui/components/card";
import { Textarea } from "@phena/ui/components/textarea";
import { DetailedError } from "hono/client";
import { FlagIcon, RefreshCwIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useConfigMutation } from "@/app/(admin)/admin/config/_hooks/use-config-mutation";
import { useFlagPreview } from "@/app/(admin)/admin/config/_hooks/use-flag-preview";

const EXPRESSIONS = [
  { name: "challengeId", description: "Challenge ID", group: "Context" },
  { name: "teamId", description: "Team ID", group: "Context" },
  { name: "serviceId", description: "Service ID", group: "Context" },
  { name: "round", description: "Current round", group: "Context" },
  { name: "tick", description: "Current tick", group: "Context" },
  { name: "index", description: "Flag index", group: "Context" },
  { name: "uuid", description: "Random UUID v4", group: "Generators" },
  { name: "random[N]", description: "N random alphanumeric chars", group: "Generators" },
  { name: "md5", description: "MD5 hash (16 hex)", group: "Generators" },
  { name: "sha256", description: "SHA256 hash (32 hex)", group: "Generators" },
  { name: "date", description: "YYYY-MM-DD", group: "Time" },
  { name: "timestamp", description: "Unix timestamp", group: "Time" },
] as const;

const GROUPS = ["Context", "Generators", "Time"] as const;

interface FlagConfigCardProps {
  initialValue: string;
}

export function FlagConfigCard({ initialValue }: FlagConfigCardProps) {
  const [draft, setDraft] = useState(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const configMutation = useConfigMutation();

  const preview = useFlagPreview(draft, true);

  const handleInsertExpression = useCallback(
    (expr: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = draft;

      const insertStr = `{{${expr}}}`;

      const newValue = value.slice(0, start) + insertStr + value.slice(end);

      setDraft(newValue);
      setIsDirty(newValue !== initialValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const newPos = start + insertStr.length;
        textarea.setSelectionRange(newPos, newPos);
      });
    },
    [draft, initialValue],
  );

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    setIsDirty(value !== initialValue);
  };

  const handleSave = async () => {
    try {
      await configMutation.mutateAsync({
        patch: { system: { flagTemplate: draft } },
      });
      setIsDirty(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  };

  const handleRegenerate = () => {
    preview.refetch();
  };

  const isInvalid = preview.isError && preview.data === undefined && draft.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlagIcon className="size-5" />
          Flag Configuration
        </CardTitle>
        <CardDescription>Configure how flags are generated for each service</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="flag-template">
                Flag Template
              </label>
              <Textarea
                ref={textareaRef}
                id="flag-template"
                value={draft}
                onChange={handleTemplateChange}
                className="font-mono text-sm"
                rows={3}
                placeholder="PHENA{{{uuid}}}"
              />
              <p className="text-muted-foreground text-xs">
                Use {"{{expression}}"} syntax to insert dynamic values
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Live Preview</label>
            <div className="bg-muted/50 relative flex flex-col gap-2 border p-3 font-mono text-xs">
              {preview.isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <RefreshCwIcon className="text-muted-foreground size-4 animate-spin" />
                </div>
              ) : preview.data?.samples && preview.data?.samples.length > 0 ? (
                preview.data?.samples.map((sample, i) => (
                  <div key={i}>
                    {i > 0 && <div className="border-border mt-2 border-t pt-2" />}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Round {sample.context.round} / Tick {sample.context.tick}
                      </span>
                    </div>
                    <code className="text-foreground mt-1 block truncate">{sample.result}</code>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-2 text-center">
                  Enter a template to preview
                </div>
              )}
              {isInvalid && (
                <div className="bg-destructive/10 text-destructive mt-2 p-2 text-[10px]">
                  {preview.error instanceof DetailedError
                    ? preview.error.detail.data.error ||
                      preview.error.detail.data.errors?.join(", ") ||
                      "Invalid template"
                    : preview.error instanceof Error
                      ? preview.error.message
                      : "Invalid template"}
                </div>
              )}
            </div>
            <div className="flex flex-row justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={preview.isFetching}
              >
                <RefreshCwIcon className={`size-3 ${preview.isFetching ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Expression Reference</label>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {GROUPS.map((group) => (
                <div key={group} className="flex flex-col gap-2">
                  <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    {group}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPRESSIONS.filter((e) => e.group === group).map((expr) => (
                      <button
                        key={expr.name}
                        type="button"
                        onClick={() => handleInsertExpression(expr.name)}
                        className="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center gap-1 border px-2 py-1"
                        title={expr.description}
                      >
                        <code className="text-foreground text-[11px] font-medium">
                          {"{{"}
                          {expr.name}
                          {"}}"}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || configMutation.isPending || isInvalid}
          >
            {configMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
