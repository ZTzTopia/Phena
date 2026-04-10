export interface MockConfig {
  contest: {
    name: string;
    tickDuration: number;
    roundDuration: number;
    startDate: string;
    endDate: string;
  };
  scoring: {
    attackPoints: number;
    defensePoints: number;
    slaWeight: number;
    firstBloodBonus: number | null;
  };
  system: {
    checkerPoolSize: number;
    checkerTimeout: number;
    flagTemplate: string;
  };
  battleMap: {
    style: string;
    markerStyle?: string;
    labelVisibility?: string;
    colorPalette?: string;
    backgroundIntensity?: number;
    hexSize?: number;
    networkForceStrength?: number;
  };
}

export const mockConfig: MockConfig = {
  contest: {
    name: "Phena CTF 2026",
    tickDuration: 60,
    roundDuration: 600,
    startDate: "2026-04-03T10:00:00Z",
    endDate: "2026-04-03T18:00:00Z",
  },
  scoring: {
    attackPoints: 100,
    defensePoints: 100,
    slaWeight: 0.1,
    firstBloodBonus: 50,
  },
  system: {
    checkerPoolSize: 10,
    checkerTimeout: 30,
    flagTemplate: "PHENA{{uuid}}",
  },
  battleMap: {
    style: "fantasy",
    markerStyle: "pin",
    labelVisibility: "always",
    colorPalette: "cyberpunk",
    backgroundIntensity: 80,
    hexSize: 40,
    networkForceStrength: -200,
  },
};
