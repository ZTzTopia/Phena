"use client";

import { Button } from "@phena/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@phena/ui/components/card";
import { PauseIcon, PlayIcon, ZapIcon, TrophyIcon } from "lucide-react";
import { toast } from "sonner";
import { ContestOverview } from "@/app/(admin)/admin/dashboard/_components/contest-overview";
import { mockDashboardScoreboard, mockTickData } from "./mock-data";

export default function AdminDashboardPage() {
  const scoreboard = mockDashboardScoreboard;
  const tickData = mockTickData;

  const isRunning = tickData?.isRunning ?? false;

  const handleStart = () => {
    toast.success("Contest started (mock)");
  };

  const handleStop = () => {
    toast.success("Contest stopped (mock)");
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Admin Command Center</h1>
        <p className="text-muted-foreground">Monitor and control the contest</p>
      </div>

      <div className="px-4 lg:px-6">
        <ContestOverview />
      </div>

      <div className="grid grid-cols-3 gap-4 px-4 lg:grid-cols-4 lg:px-6">
        <Card className="col-span-3 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ZapIcon className="text-primary size-5" />
              Battle Control
            </CardTitle>
            <CardDescription>Global contest actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isRunning ? (
                <Button variant="outline" onClick={handleStop}>
                  <PauseIcon className="mr-2 size-4" />
                  Stop Contest
                </Button>
              ) : (
                <Button variant="default" onClick={handleStart}>
                  <PlayIcon className="mr-2 size-4" />
                  Start Contest
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="text-primary size-5" />
              Live Scoreboard
            </CardTitle>
            <CardDescription>Top 5 teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scoreboard?.scoreboard?.slice(0, 5)?.map((team: any, index: number) => (
                <div key={team.teamId} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 font-mono text-sm">#{index + 1}</span>
                    <span className="font-medium">{team.teamName}</span>
                  </div>
                  <span className="font-mono text-sm">{team.totalScore} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
