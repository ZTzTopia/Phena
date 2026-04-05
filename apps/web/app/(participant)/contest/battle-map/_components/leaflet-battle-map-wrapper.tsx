"use client";

import { Skeleton } from "@phena/ui/components/8bit/skeleton";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const LeafletBattleMap = dynamic(
  () => import("./leaflet-battle-map").then((mod) => mod.LeafletBattleMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    ),
  },
);

interface LeafletBattleMapWrapperProps {
  teams: {
    id: string;
    name: string;
    score: number;
  }[];
  attacks: {
    id: string;
    attackerId: string;
    targetId: string;
  }[];
  config: {
    mapMode?: "earth" | "custom";
    customMapUrl?: string;
    backgroundIntensity?: number;
    tileUrl?: string;
    interactive?: boolean;
  };
}

export function LeafletBattleMapWrapper(props: LeafletBattleMapWrapperProps) {
  return <LeafletBattleMap {...props} />;
}
