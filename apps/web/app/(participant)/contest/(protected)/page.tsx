"use client";

import PlayerProfileCard from "@phena/ui/components/8bit/blocks/player-profile-card";
import { useQuery } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import Loading from "@/app/(participant)/loading";
import { useAuth } from "@/app/auth-provider";
import { client } from "@/lib/api-client";

export default function MissionCenterPage() {
  const { team } = useAuth();

  if (!team) {
    return <Loading />;
  }

  const { data: scoreboardData, isSuccess } = useQuery({
    queryKey: ["contest", "scoreboard"],
    queryFn: async () => await parseResponse(client.api.scoreboard.$get()),
  });

  if (!isSuccess) {
    return <Loading />;
  }

  const { standings } = scoreboardData;
  const myStanding = standings.find((s) => s.teamId === team.id);

  const attackPoints = myStanding?.attackPoints ?? 0;
  const defensePoints = myStanding?.defensePoints ?? 0;
  const slaPoints = myStanding?.slaPoints ?? 0;
  const rank = myStanding?.rank ?? standings.length + 1;

  const maxAttack = Math.max(...standings.map((s) => s.attackPoints));
  const maxDefense = Math.max(...standings.map((s) => s.defensePoints));
  const maxSla = Math.max(...standings.map((s) => s.slaPoints));

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mb-8 text-center">
        <h2 className="retro mb-3 text-2xl font-bold tracking-tight md:text-3xl">Contest</h2>
        <p className="retro text-muted-foreground text-[9px]">Description.</p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 lg:col-span-8">
        <PlayerProfileCard
          playerName={team.name}
          level={rank}
          playerClass="CTF Challenger"
          showLevel={true}
          showHealth={false}
          showMana={false}
          showExperience={false}
          customStats={[
            { label: "Attack", value: attackPoints, max: maxAttack, color: "bg-orange-500" },
            { label: "Defense", value: defensePoints, max: maxDefense, color: "bg-cyan-500" },
            { label: "SLA", value: slaPoints, max: maxSla, color: "bg-purple-500" },
          ]}
          className="retro max-w-full"
        />
      </div>
    </div>
  );
}
