"use client";

import { MapMarker, MapPopup, MapTooltip } from "@phena/ui/components/map";
import { MapPin } from "pixelarticons/react";

export function TeamMarker({
  team,
  position,
}: {
  team: {
    name: string;
    score: number;
  };
  position: [number, number];
}) {
  return (
    <MapMarker
      position={position}
      iconAnchor={[6, 24]}
      popupAnchor={[0, -24]}
      tooltipAnchor={[0, -24]}
      icon={
        <div className="flex flex-col items-center gap-0.5">
          <MapPin className="text-foreground" />
          <span className="font-pixel text-foreground text-center text-[0.45rem]">{team.name}</span>
        </div>
      }
    >
      <MapTooltip className="rounded-none" direction="top" sideOffset={12}>
        <span className="font-pixel text-xs">{team.name}</span>
      </MapTooltip>
      <MapPopup className="retro">
        <div className="flex flex-col gap-1 p-1">
          <div className="font-pixel text-sm font-bold">{team.name}</div>
          <div className="text-muted-foreground text-xs">Score: {team.score.toLocaleString()}</div>
        </div>
      </MapPopup>
    </MapMarker>
  );
}
