"use client";

import type { ScoreboardEntry } from "../columns";
import { mockScoreboardResponse } from "../mock-data";

export function useLeaderboard() {
  const scoreboard: ScoreboardEntry[] = mockScoreboardResponse.scoreboard;
  const isLoading = false;

  return { scoreboard, isLoading };
}
