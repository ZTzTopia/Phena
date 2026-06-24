"use client";

import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { ScoreboardModel, SSEEventType } from "@phena/schema";
import { client } from "@/lib/api-client";
import { useSSE } from "@/app/sse-provider";

export function useLeaderboard() {
  const { data, isLoading, isFetching } = useQuery({
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
    isLoading: isLoading || isFetching,
  };
}
