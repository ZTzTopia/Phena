"use client";

import { ScoreboardModel, SSEEventType } from "@phena/schema";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { useSSE } from "@/app/sse-provider";
import { client } from "@/lib/api-client";

export function useLeaderboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "scoreboard"],
    queryFn: async () => {
      const res = await parseResponse(client.api.scoreboard.$get());
      return ScoreboardModel.standingsResponse.parse(res);
    },
  });

  useSSE([SSEEventType.Scoreboard], {
    invalidateQueries: { [SSEEventType.Scoreboard]: ["admin", "scoreboard"] },
  });

  return {
    scoreboard: data?.standings ?? [],
    isLoading,
    isError,
    refetch,
  };
}
