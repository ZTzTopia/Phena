"use client";

import { Button } from "@phena/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@phena/ui/components/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DetailedError, parseResponse } from "hono/client";
import { PauseIcon, PlayIcon, RotateCcwIcon, ZapIcon, TrophyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ContestOverview } from "@/app/(admin)/admin/dashboard/_components/contest-overview";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { client } from "@/lib/api-client";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data: contestStatus } = useQuery({
    queryKey: ["admin", "contest", "status"],
    queryFn: async () => parseResponse(client.api.contest.status.$get()),
  });

  const startMutation = useMutation({
    mutationFn: async () => parseResponse(client.api.contest.start.$post()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contest", "status"] });
      toast.success("Contest started");
    },
    onError: (err) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "Failed to start contest",
      );
    },
    meta: { skipGlobalError: true },
  });

  const stopMutation = useMutation({
    mutationFn: async () => parseResponse(client.api.contest.stop.$post()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contest", "status"] });
      toast.success("Contest stopped");
    },
    onError: (err) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "Failed to stop contest",
      );
    },
    meta: { skipGlobalError: true },
  });

  const resetMutation = useMutation({
    mutationFn: async () => parseResponse(client.api.contest.reset.$post()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contest", "status"] });
      toast.success("Contest reset");
    },
    onError: (err) => {
      toast.error(
        err instanceof DetailedError
          ? err.detail.data.error
          : err instanceof Error
            ? err.message
            : "Failed to reset contest",
      );
    },
    meta: { skipGlobalError: true },
  });

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const isRunning = contestStatus?.isRunning ?? false;

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
            <div className="flex flex-col gap-2">
              {isRunning ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => stopMutation.mutate()}
                  disabled={stopMutation.isPending}
                >
                  <PauseIcon className="mr-2 size-4" />
                  Stop Contest
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                >
                  <PlayIcon className="mr-2 size-4" />
                  Start Contest
                </Button>
              )}
            </div>
            <hr className="border-border" />
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground w-full"
              onClick={() => setResetConfirmOpen(true)}
              disabled={resetMutation.isPending}
            >
              <RotateCcwIcon className="mr-2 size-4" />
              Reset Contest
            </Button>
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
            <p className="text-muted-foreground py-4 text-center">
              Leaderboard will be available once the scoring engine is active.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Contest"
        description="This will clear all scores, flags, submissions, and game data. This action cannot be undone."
        confirmText="Reset"
        variant="destructive"
        requiredInput="RESET"
        onConfirm={() => {
          resetMutation.mutate();
          setResetConfirmOpen(false);
        }}
      />
    </div>
  );
}
