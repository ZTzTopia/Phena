"use client";

import { useQuery } from "@tanstack/react-query";
import type { ScoreboardEntry } from "../columns";
import { mockScoreboardResponse } from "../mock-data";

export interface UseLeaderboardOptions {
  refetchInterval?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const scoreboard: ScoreboardEntry[] = mockScoreboardResponse.scoreboard;
  const isLoading = false;

  return { scoreboard, isLoading };
}
