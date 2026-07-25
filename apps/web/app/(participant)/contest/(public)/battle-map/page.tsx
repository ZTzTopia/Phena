"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@phena/ui/components/8bit/card";
import { LeafletBattleMapWrapper } from "@/app/(participant)/contest/(public)/battle-map/_components/leaflet-battle-map-wrapper";

const teamsMock: {
  id: string;
  name: string;
  score: number;
}[] = [
  { id: "1", name: "ICC UH", score: 1000 },
  { id: "2", name: "HCS", score: 850 },
  { id: "3", name: "PETIR", score: 720 },
  { id: "4", name: "TCP1P", score: 650 },
  { id: "5", name: "CSUI", score: 500 },
  { id: "6", name: "Ijazahnya mana woi", score: 350 },
  { id: "7", name: "ICC Pisang Molen", score: 750 },
  { id: "8", name: "ICC De bluz", score: 750 },
];

const attacksMock: {
  id: string;
  attackerId: string;
  targetId: string;
  attackerTeamId: number;
  attackerTeamName: string;
  targetTeamId: number;
  targetTeamName: string;
  challengeId: number;
  challengeName: string;
  points: number;
  tick: number;
  round: number;
  timestamp: number;
}[] = [
  {
    id: "1",
    attackerId: "1",
    targetId: "2",
    attackerTeamId: 1,
    attackerTeamName: "ICC UH",
    targetTeamId: 2,
    targetTeamName: "HCS",
    challengeId: 1,
    challengeName: "Challenge 1",
    points: 100,
    tick: 1,
    round: 1,
    timestamp: Date.now(),
  },
  {
    id: "2",
    attackerId: "3",
    targetId: "4",
    attackerTeamId: 3,
    attackerTeamName: "PETIR",
    targetTeamId: 4,
    targetTeamName: "TCP1P",
    challengeId: 2,
    challengeName: "Challenge 2",
    points: 75,
    tick: 2,
    round: 1,
    timestamp: Date.now(),
  },
];

const MapStyle = {
  Network: "network",
  Earth: "earth",
  Westeros: "westeros",
};

const earthConfig: {
  style: string;
  mapMode: "earth";
  interactive: false;
  arc: true;
} = {
  style: MapStyle.Network,
  mapMode: "earth",
  interactive: false,
  arc: true,
};

export default function MapPage() {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-10 text-center">
        <h2 className="retro mb-3 text-2xl font-bold tracking-tight md:text-3xl">Battle Map</h2>
        <p className="retro text-muted-foreground text-[9px]">Description.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-pixel text-muted-foreground text-sm">Earth</CardTitle>
        </CardHeader>
        <CardContent>
          <LeafletBattleMapWrapper teams={teamsMock} attacks={attacksMock} config={earthConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
