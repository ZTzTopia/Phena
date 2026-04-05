"use client";

import { Map as LeafletMapComponent, MapTileLayer } from "@phena/ui/components/map";
import { useEffect } from "react";
import { AttackPolylineWithPosition } from "./attack-polyline";
import { TeamMarker } from "./team-marker";

interface EarthMapProps {
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
  tileUrl?: string;
  getTeamPosition: (teamId: string) => [number, number];
  markerPositionsRef: React.MutableRefObject<globalThis.Map<string, [number, number]>>;
  interactive?: boolean;
}

const DEFAULT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}";

export function EarthMap({
  teams,
  attacks,
  tileUrl,
  getTeamPosition,
  markerPositionsRef,
  interactive = true,
}: EarthMapProps) {
  useEffect(() => {
    markerPositionsRef.current.clear();
    teams.forEach((team) => {
      markerPositionsRef.current.set(team.id, getTeamPosition(team.id));
    });
  }, [teams, getTeamPosition, markerPositionsRef]);

  const lockedProps = interactive
    ? {}
    : {
        dragging: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      };

  return (
    <LeafletMapComponent center={[20, 0]} zoom={2} className="size-full" {...lockedProps}>
      <MapTileLayer url={tileUrl || DEFAULT_TILE_URL} />
      {teams.map((team) => (
        <TeamMarker key={team.id} team={team} position={getTeamPosition(team.id)} />
      ))}
      {attacks.slice(0, 50).map((attack) => (
        <AttackPolylineWithPosition
          key={attack.id}
          attack={attack}
          markerPositionsRef={markerPositionsRef}
        />
      ))}
    </LeafletMapComponent>
  );
}
