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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@phena/ui/components/select";
import { Slider } from "@phena/ui/components/slider";
import { CogIcon, MapIcon, SettingsIcon, TrophyIcon } from "lucide-react";
import { ConfigCard } from "@/app/(admin)/admin/config/_components/config-card";
import { mockConfig, type MockConfig } from "./mock-data";

const MAP_STYLES = [
  {
    value: "fantasy" as const,
    label: "Fantasy",
    description: "Parchment, pine trees, hand-drawn look",
    color: "bg-[#e6ddc5] border-[#8b7355]",
  },
  {
    value: "geographic" as const,
    label: "Geographic",
    description: "World map with lat/long projection",
    color: "bg-slate-900 border-slate-700",
  },
  {
    value: "hex" as const,
    label: "HexMap",
    description: "Grid of flat-top glowing hexagons",
    color: "bg-black border-green-500/50",
  },
  {
    value: "network" as const,
    label: "Network",
    description: "D3-like nodes connected by grid",
    color: "bg-black border-primary/50",
  },
];

function Loading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}

function isMarkerStyle(value: string): value is "pin" | "flag" | "dot" {
  return ["pin", "flag", "dot"].includes(value);
}

function isLabelVisibility(value: string): value is "always" | "hover" | "none" {
  return ["always", "hover", "none"].includes(value);
}

function isColorPalette(
  value: string,
): value is "cyberpunk" | "fantasy" | "minimal" | "monochrome" {
  return ["cyberpunk", "fantasy", "minimal", "monochrome"].includes(value);
}

type BattleMapConfig = MockConfig["battleMap"];
type Config = MockConfig;

export default function ConfigPage() {
  const config = mockConfig;

  if (!config) {
    return <Loading />;
  }

  const battleMap: BattleMapConfig = {
    style: config.battleMap.style as "fantasy" | "geographic" | "hex" | "network",
    markerStyle: config.battleMap.markerStyle as "pin" | "flag" | "dot" | undefined,
    labelVisibility: config.battleMap.labelVisibility as "always" | "hover" | "none" | undefined,
    colorPalette: config.battleMap.colorPalette as
      | "cyberpunk"
      | "fantasy"
      | "minimal"
      | "monochrome"
      | undefined,
    backgroundIntensity: config.battleMap.backgroundIntensity,
    hexSize: config.battleMap.hexSize,
    networkForceStrength: config.battleMap.networkForceStrength,
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Manage global contest settings</p>
      </div>

      <div className="px-4 lg:px-6">
        <ConfigCard
          key={JSON.stringify(config.contest)}
          title="Contest Settings"
          icon={<TrophyIcon className="size-5" />}
          description="Configure contest name, timing, and duration"
          initialValue={config.contest}
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
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, tickDuration: value ?? 0 }))
                  }
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
      </div>

      <div className="px-4 lg:px-6">
        <ConfigCard
          key={JSON.stringify(config.scoring)}
          title="Scoring Parameters"
          icon={<SettingsIcon className="size-5" />}
          description="Configure points and scoring weights"
          initialValue={config.scoring}
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
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, attackPoints: value ?? 0 }))
                  }
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
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, slaWeight: value ?? 0 }))
                  }
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
      </div>

      <div className="px-4 lg:px-6">
        <ConfigCard
          key={JSON.stringify(config.system)}
          title="System Constraints"
          icon={<CogIcon className="size-5" />}
          description="Configure checker and flag parameters"
          initialValue={config.system}
          schema={{} as any}
          toPatch={(system) => ({ system })}
          successMessage="System constraints saved"
        >
          {({ draft, setDraft, getFieldError, getFieldErrors }) => (
            <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field data-invalid={Boolean(getFieldError("checkerPoolSize")) || undefined}>
                <FieldLabel htmlFor="checker-pool-size">Checker Pool Size</FieldLabel>
                <NumberInput
                  id="checker-pool-size"
                  min={1}
                  max={100}
                  step={1}
                  value={draft.checkerPoolSize}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, checkerPoolSize: value ?? 0 }))
                  }
                  endAddon="workers"
                  aria-invalid={Boolean(getFieldError("checkerPoolSize")) || undefined}
                />
                <FieldDescription>Concurrent checker worker pool size.</FieldDescription>
                <FieldError errors={getFieldErrors("checkerPoolSize")} />
              </Field>

              <Field data-invalid={Boolean(getFieldError("checkerTimeout")) || undefined}>
                <FieldLabel htmlFor="checker-timeout">Checker Timeout</FieldLabel>
                <NumberInput
                  id="checker-timeout"
                  min={5}
                  max={300}
                  step={1}
                  value={draft.checkerTimeout}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, checkerTimeout: value ?? 0 }))
                  }
                  endAddon="seconds"
                  aria-invalid={Boolean(getFieldError("checkerTimeout")) || undefined}
                />
                <FieldDescription>Maximum execution time per checker run.</FieldDescription>
                <FieldError errors={getFieldErrors("checkerTimeout")} />
              </Field>

              <Field data-invalid={Boolean(getFieldError("flagLength")) || undefined}>
                <FieldLabel htmlFor="flag-length">Flag Length</FieldLabel>
                <NumberInput
                  id="flag-length"
                  min={16}
                  max={64}
                  step={1}
                  value={draft.flagLength}
                  onValueChange={(value) =>
                    setDraft((prev) => ({ ...prev, flagLength: value ?? 0 }))
                  }
                  endAddon="chars"
                  aria-invalid={Boolean(getFieldError("flagLength")) || undefined}
                />
                <FieldDescription>Total generated flag length.</FieldDescription>
                <FieldError errors={getFieldErrors("flagLength")} />
              </Field>

              <Field data-invalid={Boolean(getFieldError("flagPrefix")) || undefined}>
                <FieldLabel htmlFor="flag-prefix">Flag Prefix</FieldLabel>
                <Input
                  id="flag-prefix"
                  value={draft.flagPrefix || ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      flagPrefix: e.target.value || null,
                    }))
                  }
                  aria-invalid={Boolean(getFieldError("flagPrefix")) || undefined}
                />
                <FieldDescription>Prefix prepended to generated flags.</FieldDescription>
                <FieldError errors={getFieldErrors("flagPrefix")} />
              </Field>
            </FieldGroup>
          )}
        </ConfigCard>
      </div>

      <div className="px-4 lg:px-6">
        <ConfigCard
          key={JSON.stringify(config.battleMap)}
          title="Map Style"
          icon={<MapIcon className="size-5" />}
          description="Configure the global map style and visuals for participants"
          initialValue={battleMap}
          schema={{} as any}
          toPatch={(draft) => ({ battleMap: draft })}
          successMessage="Map settings saved"
        >
          {({ draft, setDraft, getFieldError }) => (
            <>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">Map Style</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {MAP_STYLES.map((style) => (
                    <div
                      key={style.value}
                      onClick={() => setDraft((prev) => ({ ...prev, style: style.value }))}
                      className={`cursor-pointer border-2 p-4 transition-all ${
                        draft.style === style.value
                          ? "border-primary bg-primary/10"
                          : "border-muted-foreground/20 hover:border-primary/50"
                      }`}
                    >
                      <div className={`mb-3 h-16 w-full border-2 ${style.color}`} />
                      <div className="font-semibold">{style.label}</div>
                      <div className="text-muted-foreground mt-1 text-xs">{style.description}</div>
                    </div>
                  ))}
                </div>
                {getFieldError("style") && (
                  <p className="text-sm text-red-500">{getFieldError("style")}</p>
                )}
              </div>

              <div className="border-muted grid grid-cols-1 gap-6 border-t pt-4 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <h3 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                    Shared Options
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Marker Style</label>
                    <Select
                      value={draft.markerStyle || "pin"}
                      onValueChange={(value) => {
                        if (isMarkerStyle(value)) {
                          setDraft((prev) => ({ ...prev, markerStyle: value }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pin">Classic Pin</SelectItem>
                        <SelectItem value="flag">Flag Icon</SelectItem>
                        <SelectItem value="dot">Simple Dot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Label Visibility</label>
                    <Select
                      value={draft.labelVisibility || "always"}
                      onValueChange={(value) => {
                        if (isLabelVisibility(value)) {
                          setDraft((prev) => ({ ...prev, labelVisibility: value }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always Show</SelectItem>
                        <SelectItem value="hover">Show on Hover</SelectItem>
                        <SelectItem value="none">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Color Palette</label>
                    <Select
                      value={draft.colorPalette || "cyberpunk"}
                      onValueChange={(value) => {
                        if (isColorPalette(value)) {
                          setDraft((prev) => ({ ...prev, colorPalette: value }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cyberpunk">Cyberpunk (Neon)</SelectItem>
                        <SelectItem value="fantasy">Fantasy (Warm)</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1 pt-2">
                    <label className="flex justify-between text-sm font-medium">
                      <span>Background Intensity</span>
                      <span className="text-muted-foreground">
                        {draft.backgroundIntensity ?? 100}%
                      </span>
                    </label>
                    <Slider
                      min={0}
                      max={100}
                      value={[draft.backgroundIntensity ?? 100]}
                      onValueChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          backgroundIntensity: value[0] ?? 100,
                        }))
                      }
                      className="accent-primary w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
                    Style-Specific
                  </h3>

                  <div
                    className={`flex flex-col gap-2 transition-opacity ${
                      draft.style === "hex" ? "opacity-100" : "pointer-events-none opacity-30"
                    }`}
                  >
                    <label className="flex justify-between text-sm font-medium">
                      <span>Hex Size (px)</span>
                      <span className="text-muted-foreground">{draft.hexSize ?? 40}</span>
                    </label>
                    <Slider
                      min={20}
                      max={80}
                      value={[draft.hexSize ?? 40]}
                      onValueChange={(value) =>
                        setDraft((prev) => ({ ...prev, hexSize: value[0] ?? 40 }))
                      }
                      className="accent-primary w-full"
                      disabled={draft.style !== "hex"}
                    />
                    <p className="text-muted-foreground text-right text-xs">
                      Applies to Hex map only
                    </p>
                  </div>

                  <div
                    className={`flex flex-col gap-2 transition-opacity ${
                      draft.style === "network" ? "opacity-100" : "pointer-events-none opacity-30"
                    }`}
                  >
                    <label className="flex justify-between text-sm font-medium">
                      <span>Network Force Strength</span>
                      <span className="text-muted-foreground">
                        {draft.networkForceStrength ?? -200}
                      </span>
                    </label>
                    <Slider
                      min={-500}
                      max={0}
                      step={10}
                      value={[draft.networkForceStrength ?? -200]}
                      onValueChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          networkForceStrength: value[0] ?? -200,
                        }))
                      }
                      className="accent-primary w-full"
                      disabled={draft.style !== "network"}
                    />
                    <p className="text-muted-foreground text-right text-xs">
                      Applies to old D3 network only
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </ConfigCard>
      </div>
    </div>
  );
}
