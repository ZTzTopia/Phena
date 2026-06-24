"use client";

import { Badge } from "@phena/ui/components/badge";
import { ActivityIcon, FlagIcon, FlagTriangleRightIcon, ShieldIcon, SwordIcon } from "lucide-react";
import { slaColor, type ChallengePoints } from "../columns";

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
            <div className="text-muted-foreground grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              <div className="flex items-center gap-1">
                <SwordIcon className="size-3" />
                <span>Attack: {challenge.attackPoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldIcon className="size-3" />
                <span>Defense: {challenge.defensePoints}</span>
              </div>
              <div className="flex items-center gap-1">
                <FlagTriangleRightIcon className="size-3" />
                <span>Stolen: {challenge.flagsStolen}</span>
              </div>
              <div className="flex items-center gap-1">
                <FlagIcon className="size-3" />
                <span>Defended: {challenge.flagsDefended}</span>
              </div>
              <div className="flex items-center gap-1">
                <ActivityIcon className="size-3" />
                <span>
                  SLA:{" "}
                  <span className={`font-mono ${slaColor(challenge.slaUp, challenge.slaTotal)}`}>
                    {challenge.slaTotal === 0 ? "0/0" : `${challenge.slaUp}/${challenge.slaTotal}`}
                  </span>
                  <span className="text-muted-foreground ml-1">({challenge.slaPoints} pts)</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
