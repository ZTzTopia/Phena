function fnv1a(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

const landRegions = [
  { latMin: 25, latMax: 70, lngMin: -130, lngMax: -60 },
  { latMin: 35, latMax: 70, lngMin: -10, lngMax: 40 },
  { latMin: -45, latMax: -10, lngMin: 110, lngMax: 155 },
  { latMin: -40, latMax: -10, lngMin: 140, lngMax: 180 },
  { latMin: 20, latMax: 50, lngMin: 100, lngMax: 145 },
  { latMin: -35, latMax: 37, lngMin: -20, lngMax: 55 },
] as const;

export function getEarthMapPosition(teamId: string): [number, number] {
  const hash = fnv1a(teamId);
  const regionIndex = hash % landRegions.length;
  const region = landRegions[regionIndex]!;

  const normalizedLat = (hash % 1000) / 1000;
  const normalizedLng = ((hash >>> 12) % 1000) / 1000;

  const lat = region.latMin + normalizedLat * (region.latMax - region.latMin);
  const lng = region.lngMin + normalizedLng * (region.lngMax - region.lngMin);

  return [lat, lng];
}
