import { describe, it, expect } from "bun:test";
import {
  calculateSlaForTick,
  calculateRoundScores,
  type ScoringFlag,
  type ScoringSubmission,
  type ScoringCheckerResult,
  type ScoringService,
  type ScoringConfig,
} from "./scoring";

const config: ScoringConfig = {
  attackPoints: 100,
  defensePoints: 50,
  slaWeight: 0.3,
  firstBloodBonus: null,
};

const services: ScoringService[] = [
  { id: 1, teamId: 1 },
  { id: 2, teamId: 2 },
];

describe("calculateSlaForTick", () => {
  it("awards sla points based on availability ratio", () => {
    const results: ScoringCheckerResult[] = [
      { serviceId: 1, round: 1, tick: 1, status: "up" },
      { serviceId: 2, round: 1, tick: 1, status: "down" },
    ];
    const result = calculateSlaForTick(services, results, config, 1, 1);
    // slaWeight=0.3, base=100+50=150, so 0.3*150=45 * ratio
    // service 1: up 1/1 = 1.0 → floor(45) = 45
    // service 2: up 0/1 = 0.0 → floor(0) = 0
    expect(result.serviceScoreRows).toHaveLength(1);
    expect(result.serviceScoreRows[0]).toMatchObject({
      teamId: 1,
      serviceId: 1,
      slaPoints: 45,
      totalPoints: 45,
    });
    expect(result.scoreRows).toHaveLength(1);
    expect(result.scoreRows[0]).toMatchObject({
      teamId: 1,
      slaPoints: 45,
      totalPoints: 45,
    });
  });

  it("returns empty when no checker results for tick", () => {
    const result = calculateSlaForTick(services, [], config, 1, 1);
    expect(result.serviceScoreRows).toHaveLength(0);
    expect(result.scoreRows).toHaveLength(0);
  });
});

describe("calculateRoundScores", () => {
  it("awards attack points to each distinct attacker of a stolen flag", () => {
    const flags: ScoringFlag[] = [
      { id: 1, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
      { id: 2, serviceId: 2, ownerTeamId: 2, round: 1, tick: 1 },
    ];
    // team 2 steals team 1's flag; team 1 steals team 2's flag
    const submissions: ScoringSubmission[] = [
      { flagId: 1, teamId: 2, createdAt: new Date("2025-01-01T00:00:01Z") },
      { flagId: 2, teamId: 1, createdAt: new Date("2025-01-01T00:00:02Z") },
    ];
    const result = calculateRoundScores(flags, submissions, [], services, config, 1, 1);
    // team 2: attacked service 1 → 100 attack
    // team 1: attacked service 2 → 100 attack, defended service 1 (flag 1 stolen, no defense)
    expect(result.scoreRows).toHaveLength(2);
    const team1 = result.scoreRows.find((r) => r.teamId === 1);
    const team2 = result.scoreRows.find((r) => r.teamId === 2);
    expect(team1?.attackPoints).toBe(100);
    expect(team1?.defensePoints).toBe(0);
    expect(team2?.attackPoints).toBe(100);
    expect(team2?.defensePoints).toBe(0);
  });

  it("awards defense points for held (un-stolen) flags", () => {
    const flags: ScoringFlag[] = [
      { id: 1, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
    ];
    const result = calculateRoundScores(flags, [], [], services, config, 1, 1);
    expect(result.scoreRows).toHaveLength(1);
    expect(result.scoreRows[0]!.defensePoints).toBe(50);
    expect(result.scoreRows[0]!.attackPoints).toBe(0);
  });

  it("excludes self-submissions from counting as attack", () => {
    const flags: ScoringFlag[] = [
      { id: 1, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
    ];
    // team 1 submits their own flag — should not count as attack
    const submissions: ScoringSubmission[] = [
      { flagId: 1, teamId: 1, createdAt: new Date("2025-01-01T00:00:01Z") },
    ];
    const result = calculateRoundScores(flags, submissions, [], services, config, 1, 1);
    expect(result.scoreRows).toHaveLength(1);
    expect(result.scoreRows[0]!.attackPoints).toBe(0);
    expect(result.scoreRows[0]!.defensePoints).toBe(50);
  });

  it("awards first blood bonus to earliest submitter", () => {
    const cfg = { ...config, firstBloodBonus: 50 };
    const flags: ScoringFlag[] = [
      { id: 1, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
    ];
    const submissions: ScoringSubmission[] = [
      { flagId: 1, teamId: 2, createdAt: new Date("2025-01-01T00:00:02Z") },
      { flagId: 1, teamId: 3, createdAt: new Date("2025-01-01T00:00:01Z") },
    ];
    const result = calculateRoundScores(flags, submissions, [], services, cfg, 1, 1);
    // team 3 (earliest) gets 100 + 50 = 150; team 2 gets 100
    const team2 = result.scoreRows.find((r) => r.teamId === 2)!;
    const team3 = result.scoreRows.find((r) => r.teamId === 3)!;
    expect(team2.attackPoints).toBe(100);
    expect(team3.attackPoints).toBe(150);
  });

  it("handles multiple flags per service per tick", () => {
    const svcs: ScoringService[] = [
      { id: 1, teamId: 1 },
    ];
    const flags: ScoringFlag[] = [
      { id: 1, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
      { id: 2, serviceId: 1, ownerTeamId: 1, round: 1, tick: 1 },
    ];
    // team 2 steals flag 1; flag 2 is held
    const submissions: ScoringSubmission[] = [
      { flagId: 1, teamId: 2, createdAt: new Date("2025-01-01T00:00:01Z") },
    ];
    const result = calculateRoundScores(flags, submissions, [], svcs, config, 1, 1);
    const team1 = result.scoreRows.find((r) => r.teamId === 1)!;
    const team2 = result.scoreRows.find((r) => r.teamId === 2)!;
    expect(team2.attackPoints).toBe(100); // 1 flag stolen
    expect(team1.defensePoints).toBe(50); // 1 flag held
  });
});
