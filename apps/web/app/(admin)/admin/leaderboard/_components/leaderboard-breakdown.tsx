"use client";

import { Badge } from "@phena/ui/components/badge";
import { ActivityIcon, ShieldIcon, SwordIcon } from "lucide-react";
import type { ChallengePoints } from "../columns";

interface LeaderboardBreakdownProps {
  challenges: ChallengePoints[];
}

export function LeaderboardBreakdown({ challenges }: LeaderboardBreakdownProps) {
  return (
    <div className="py-2">
      <div className="mb-3 text-sm font-medium">Challenge Breakdown</div>
      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div key={challenge.challengeId} className="bg-background border p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{challenge.challengeName}</span>
              <Badge>{challenge.totalPoints} pts</Badge>
            </div>
            <div className="text-muted-foreground grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div className="flex items-center gap-1">
                <SwordIcon className="size-3" />
                <span>Attack: {challenge.attackPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldIcon className="size-3" />
                <span>Defense: {challenge.defensePoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <ActivityIcon className="size-3" />
                <span>SLA: {challenge.slaPoints}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
