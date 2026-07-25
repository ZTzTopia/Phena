"use client";

import { MapPolyline } from "@phena/ui/components/map";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";

interface AttackPolylineProps {
  attack: {
    attackerId: string;
    targetId: string;
  };
  getMarkerPosition: (teamId: string) => [number, number] | null;
}

export function AttackPolyline({ attack, getMarkerPosition }: AttackPolylineProps) {
  const polylineRef = useRef<L.Polyline | null>(null);
  const animationRef = useRef<number | null>(null);

  const positions = useMemo<[number, number][]>(() => {
    const attackerPos = getMarkerPosition(attack.attackerId);
    const targetPos = getMarkerPosition(attack.targetId);
    if (!attackerPos || !targetPos) return [];
    return [attackerPos, targetPos];
  }, [attack.attackerId, attack.targetId, getMarkerPosition]);

  useEffect(() => {
    if (positions.length === 0) return;

    let dashOffset = 0;
    const animate = () => {
      dashOffset = (dashOffset + 1) % 20;
      if (polylineRef.current) {
        polylineRef.current.setStyle({ dashOffset: String(-dashOffset) });
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [positions]);

  if (positions.length === 0) {
    return null;
  }

  return (
    <MapPolyline
      positions={positions}
      ref={polylineRef}
      color="#dc2626"
      weight={2}
      opacity={0.8}
      dashArray="10, 10"
    />
  );
}

export function AttackPolylineWithPosition({
  attack,
  markerPositionsRef,
}: {
  attack: {
    attackerId: string;
    targetId: string;
  };
  markerPositionsRef: React.MutableRefObject<globalThis.Map<string, [number, number]>>;
}) {
  const getMarkerPosition = (teamId: string): [number, number] | null => {
    return markerPositionsRef.current.get(teamId) || null;
  };

  return <AttackPolyline attack={attack} getMarkerPosition={getMarkerPosition} />;
}
