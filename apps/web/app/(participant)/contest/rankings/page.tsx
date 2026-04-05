"use client";

import { Leaderboard } from "@phena/ui/components/8bit/blocks/leaderboard";
import { useAuth } from "@/app/auth-provider";

const mockLeaderboardPlayers = [
  { id: "1", name: "ztz", score: 8500, isCurrentPlayer: true },
  { id: "2", name: "Alice", score: 9200 },
  { id: "3", name: "Bob", score: 7800 },
  { id: "4", name: "Charlie", score: 7200 },
  { id: "5", name: "Diana", score: 6500 },
  { id: "6", name: "Eve", score: 5800 },
  { id: "7", name: "Frank", score: 5100 },
  { id: "8", name: "Grace", score: 4400 },
];

export default function LeaderboardPage() {
  const { team } = useAuth();

  return (
    <div className="flex w-full flex-col">
      <div className="mb-10 text-center">
        <h2 className="retro mb-3 text-2xl font-bold tracking-tight md:text-3xl">Rankings</h2>
        <p className="retro text-muted-foreground text-[9px]">
          Current standings based on team scores.
        </p>
      </div>

      <Leaderboard
        title=""
        players={mockLeaderboardPlayers}
        currentPlayerId={team?.id ?? undefined}
        maxPlayers={8}
        className="retro"
      />
    </div>
  );
}
