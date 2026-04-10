"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@phena/ui/components/tabs";
import { CogIcon, FlagIcon, SettingsIcon, TrophyIcon } from "lucide-react";
import { ContestConfigCard } from "@/app/(admin)/admin/config/_components/contest-config-card";
import { FlagConfigCard } from "@/app/(admin)/admin/config/_components/flag-config-card";
import { ScoringConfigCard } from "@/app/(admin)/admin/config/_components/scoring-config-card";
import { SystemConfigCard } from "@/app/(admin)/admin/config/_components/system-config-card";
import { mockConfig } from "./mock-data";

function Loading() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  );
}

export default function ConfigPage() {
  const config = mockConfig;

  if (!config) {
    return <Loading />;
  }

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
          <ContestConfigCard initialValue={config.contest} />
        </TabsContent>

        <TabsContent value="scoring" className="mt-6">
          <ScoringConfigCard initialValue={config.scoring} />
        </TabsContent>

        <TabsContent value="flags" className="mt-6">
          <FlagConfigCard initialValue={config.system.flagTemplate} />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemConfigCard initialValue={config.system} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
