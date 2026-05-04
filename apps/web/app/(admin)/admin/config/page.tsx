"use client";

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

interface ConfigData {
  contestName: string;
  tickDuration: number;
  roundDuration: number;
  startDate: string;
  endDate: string;
  attackPoints: number;
  defensePoints: number;
  slaWeight: number;
  firstBloodBonus: number | null;
  checkerPoolSize: number;
  checkerTimeout: number;
  flagTemplate: string;
  [key: string]: unknown;
}

export default function ConfigPage() {
  const { data: configData, isLoading } = useQuery({
    queryKey: ["admin", "config"],
    queryFn: async () => {
      const res = await parseResponse(client.api.config.$get());
      return res as ConfigData;
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  const contest = {
    name: configData?.contestName ?? "Phena CTF",
    tickDuration: configData?.tickDuration ?? 60,
    roundDuration: configData?.roundDuration ?? 600,
    startDate: configData?.startDate ?? new Date().toISOString(),
    endDate: configData?.endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const scoring = {
    attackPoints: configData?.attackPoints ?? 100,
    defensePoints: configData?.defensePoints ?? 50,
    slaWeight: configData?.slaWeight ?? 0.3,
    firstBloodBonus: configData?.firstBloodBonus ?? null,
  };

  const system = {
    checkerPoolSize: configData?.checkerPoolSize ?? 10,
    checkerTimeout: configData?.checkerTimeout ?? 30,
    flagTemplate: configData?.flagTemplate ?? "PHENA{{{uuid}}}",
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
