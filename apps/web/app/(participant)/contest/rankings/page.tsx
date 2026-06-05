"use client";

import { Input } from "@phena/ui/components/8bit/input";
import { Leaderboard } from "@phena/ui/components/8bit/blocks/leaderboard";
import { Search } from "pixelarticons/react";
import { useMemo, useState } from "react";
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
  const [searchInput, setSearchInput] = useState("");

  const filteredPlayers = useMemo(
    () =>
      mockLeaderboardPlayers.filter((player) => {
        if (!searchInput) return true;
        return player.name.toLowerCase().includes(searchInput.toLowerCase());
      }),
    [searchInput],
  );

  return (
    <div className="flex w-full flex-col">
      <div className="mb-10 text-center">
        <h2 className="retro mb-3 text-2xl font-bold tracking-tight md:text-3xl">Rankings</h2>
        <p className="retro text-muted-foreground text-[9px]">
          Current standings based on team scores.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search players..."
          className="w-full pl-10"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Leaderboard
        title=""
        players={filteredPlayers}
        currentPlayerId={team?.id ?? undefined}
        maxPlayers={8}
        className="retro"
      />
    </div>
  );
}
