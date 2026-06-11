"use client";

import { Badge } from "@phena/ui/components/badge";
import { Card, CardHeader, CardDescription, CardContent } from "@phena/ui/components/card";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { UsersIcon, FlagIcon, ServerIcon, ActivityIcon, ClockIcon, TimerIcon } from "lucide-react";
import { client } from "@/lib/api-client";

export function ContestOverview() {
  const { data: teamsData } = useQuery({
    queryKey: ["admin", "teams", { page: 1, limit: 1 }],
    queryFn: async () =>
      parseResponse(
        client.api.teams.$get({
          query: { page: "1", limit: "1" },
        }),
      ),
  });

  const { data: challengesData } = useQuery({
    queryKey: ["admin", "challenges", { page: 1, limit: 1 }],
    queryFn: async () =>
      parseResponse(
        client.api.challenges.$get({
          query: { page: "1", limit: "1" },
        }),
      ),
  });

  const { data: servicesData } = useQuery({
    queryKey: ["admin", "services", { page: 1, limit: 1 }],
    queryFn: async () =>
      parseResponse(
        client.api.services.$get({
          query: { page: "1", limit: "1" },
        }),
      ),
  });

  const { data: contestStatus } = useQuery({
    queryKey: ["admin", "contest", "status"],
    queryFn: async () => parseResponse(client.api.contest.status.$get()),
  });

  const teamsCount = teamsData?.pagination.total ?? 0;
  const challengesCount = challengesData?.pagination.total ?? 0;
  const servicesCount = servicesData?.pagination.total ?? 0;
  const currentRound = contestStatus?.currentRound ?? 0;
  const currentTick = contestStatus?.currentTick ?? 0;
  const isRunning = contestStatus?.isRunning ?? false;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="to-card bg-linear-to-br from-blue-500/10">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <UsersIcon className="size-4 text-blue-500" />
            Teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">{teamsCount}</div>
          <p className="text-muted-foreground text-xs">Registered teams</p>
        </CardContent>
      </Card>

      <Card className="to-card bg-linear-to-br from-green-500/10">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <FlagIcon className="size-4 text-green-500" />
            Challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">{challengesCount}</div>
          <p className="text-muted-foreground text-xs">Total</p>
        </CardContent>
      </Card>

      <Card className="to-card bg-linear-to-br from-purple-500/10">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <ServerIcon className="size-4 text-purple-500" />
            Services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tabular-nums">{servicesCount}</div>
          <p className="text-muted-foreground text-xs">Running instances</p>
        </CardContent>
      </Card>

      <Card className="to-card bg-linear-to-br from-amber-500/10">
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-amber-500" />
            Contest Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? "default" : "secondary"} className="text-sm">
              {isRunning ? "Running" : "Paused"}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3" />
              Tick {currentTick}
            </span>
            <span className="flex items-center gap-1">
              <TimerIcon className="size-3" />
              Round {currentRound}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
