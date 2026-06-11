"use client";

import { ConfigModel } from "@phena/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@phena/ui/components/tabs";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { CogIcon, FlagIcon, SettingsIcon, TrophyIcon } from "lucide-react";
import { ContestConfigCard } from "@/app/(admin)/admin/config/_components/contest-config-card";
import { FlagConfigCard } from "@/app/(admin)/admin/config/_components/flag-config-card";
import { ScoringConfigCard } from "@/app/(admin)/admin/config/_components/scoring-config-card";
import { SystemConfigCard } from "@/app/(admin)/admin/config/_components/system-config-card";
import { client } from "@/lib/api-client";

function Loading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}

export default function ConfigPage() {
  const { data: configEntries, isLoading } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      const res = await parseResponse(client.api.config.$get());
      return ConfigModel.configListResponse.parse(res);
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  const config: Record<string, string | number | boolean | null | undefined> = {};
  for (const entry of configEntries ?? []) {
    config[entry.key] = entry.value;
  }

  const contest = {
    name: typeof config.contestName === "string" ? config.contestName : "Phena CTF",
    tickDuration: typeof config.tickDuration === "number" ? config.tickDuration : 60,
    tickPerRound: typeof config.tickPerRound === "number" ? config.tickPerRound : 5,
    totalRounds: typeof config.totalRounds === "number" ? config.totalRounds : 10,
    startDate: typeof config.startDate === "string" ? config.startDate : new Date().toISOString(),
  };

  const scoring = {
    attackPoints: typeof config.attackPoints === "number" ? config.attackPoints : 100,
    defensePoints: typeof config.defensePoints === "number" ? config.defensePoints : 50,
    slaWeight: typeof config.slaWeight === "number" ? config.slaWeight : 0.3,
    firstBloodBonus: typeof config.firstBloodBonus === "number" ? config.firstBloodBonus : null,
  };

  const system = {
    checkerPoolSize: typeof config.checkerPoolSize === "number" ? config.checkerPoolSize : 10,
    checkerTimeout: typeof config.checkerTimeout === "number" ? config.checkerTimeout : 30,
    flagTemplate: typeof config.flagTemplate === "string" ? config.flagTemplate : "PHENA{{{uuid}}}",
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Manage global contest settings</p>
      </div>

      <Tabs defaultValue="contest" className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="contest">
            <TrophyIcon className="size-4" />
            Contest
          </TabsTrigger>
          <TabsTrigger value="scoring">
            <SettingsIcon className="size-4" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="flags">
            <FlagIcon className="size-4" />
            Flags
          </TabsTrigger>
          <TabsTrigger value="system">
            <CogIcon className="size-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contest" className="mt-6">
          <ContestConfigCard initialValue={contest} />
        </TabsContent>

        <TabsContent value="scoring" className="mt-6">
          <ScoringConfigCard initialValue={scoring} />
        </TabsContent>

        <TabsContent value="flags" className="mt-6">
          <FlagConfigCard initialValue={system.flagTemplate} />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemConfigCard initialValue={system} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
