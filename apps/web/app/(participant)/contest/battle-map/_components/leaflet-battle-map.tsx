"use client";

import { cn } from "@phena/ui/lib/utils";
import { useRef } from "react";
import { EarthMap } from "./earth-map";
import { getEarthMapPosition } from "./position-utils";

interface LeafletBattleMapProps {
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

export function LeafletBattleMap({ teams, attacks, config }: LeafletBattleMapProps) {
  const markerPositionsRef = useRef<globalThis.Map<string, [number, number]>>(new globalThis.Map());

  const mapMode = config.mapMode || "earth";

  if (mapMode === "custom" && !config.customMapUrl) {
    return (
      <div className="bg-muted text-muted-foreground flex h-128 items-center justify-center">
        Custom map image not configured
      </div>
    );
  }

  return (
    <div
      className={cn(
        "size-full overflow-hidden rounded-md",
        config.backgroundIntensity !== undefined
          ? `opacity-[${config.backgroundIntensity / 100}]`
          : "opacity-100",
      )}
      style={{ height: "500px", width: "100%" }}
    >
      <div className="flex h-full items-center justify-center bg-gray-100">
        <EarthMap
          teams={teams}
          attacks={attacks}
          tileUrl={config.tileUrl}
          getTeamPosition={getEarthMapPosition}
          markerPositionsRef={markerPositionsRef}
          interactive={config.interactive}
        />
      </div>
    </div>
  );
}
