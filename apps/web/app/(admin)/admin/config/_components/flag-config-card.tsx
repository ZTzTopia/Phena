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
import { FlagIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useConfigMutation } from "@/app/(admin)/admin/config/_hooks/use-config-mutation";

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
  const configMutation = useConfigMutation();

  const SAMPLE_FLAGS = [
    "PHENA{a1b2c3d4-e5f6-7890-abcd-ef1234567890}",
    "PHENA{b3c4d5e6-f7a8-8901-bcde-f23456789012}",
  ];

  const handleSave = async () => {
    try {
      await configMutation.mutateAsync({
        patch: { system: { flagTemplate: draft } },
      });
      setIsDirty(false);
      toast.success("Flag template saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    }
  };

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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="flag-template">
                Flag Template
              </label>
              <Textarea
                id="flag-template"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setIsDirty(e.target.value !== initialValue);
                }}
                className="font-mono text-sm"
                rows={3}
                placeholder="PHENA{{uuid}}"
              />
              <p className="text-muted-foreground text-xs">
                Use {"{{expression}}"} syntax to insert dynamic values
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Live Preview</label>
              <div className="bg-muted/50 relative flex flex-col gap-2 rounded-md border p-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Round 1 / Tick 1</span>
                  <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px]">
                    PLACEHOLDER
                  </span>
                </div>
                <code className="text-foreground truncate">{SAMPLE_FLAGS[0]}</code>
                <div className="border-border mt-1 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Round 5 / Tick 3</span>
                    <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px]">
                      PLACEHOLDER
                    </span>
                  </div>
                  <code className="text-foreground mt-1 block truncate">{SAMPLE_FLAGS[1]}</code>
                </div>
                <p className="text-muted-foreground mt-2 text-[10px]">
                  Live preview will update when flag expressions are implemented
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Expression Reference</label>
              <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                Coming Soon
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {GROUPS.map((group) => (
                <div key={group} className="flex flex-col gap-2">
                  <h4 className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    {group}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPRESSIONS.filter((e) => e.group === group).map((expr) => (
                      <div
                        key={expr.name}
                        className="bg-muted/30 flex cursor-not-allowed items-center gap-1 rounded border px-2 py-1 opacity-50"
                        title={expr.description}
                      >
                        <code className="text-foreground text-[11px] font-medium">
                          {"{{"}
                          {expr.name}
                          {"}}"}
                        </code>
                      </div>
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
            disabled={!isDirty || configMutation.isPending}
          >
            {configMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
