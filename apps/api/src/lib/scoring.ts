export interface ScoringConfig {
  attackPoints: number;
  defensePoints: number;
  slaWeight: number;
  firstBloodBonus: number | null;
}

export interface ScoringFlag {
  id: number;
  serviceId: number;
  ownerTeamId: number;
  round: number;
  tick: number;
}

export interface ScoringSubmission {
  flagId: number;
  teamId: number;
  createdAt: Date;
}

export interface ScoringCheckerResult {
  serviceId: number;
  round: number;
  tick: number;
  status: string;
}

export interface ScoringService {
  id: number;
  teamId: number;
}

export interface ServiceScoreRow {
  teamId: number;
  serviceId: number;
  round: number;
  tick: number;
  attackPoints: number;
  defensePoints: number;
  slaPoints: number;
  totalPoints: number;
}

export type ScoreRow = Omit<ServiceScoreRow, "serviceId">;

export interface ScoreResult {
  serviceScoreRows: ServiceScoreRow[];
  scoreRows: ScoreRow[];
}

function slaPointsFor(results: ScoringCheckerResult[], config: ScoringConfig): number {
  if (results.length === 0) return 0;
  const upCount = results.filter((r) => r.status === "up").length;
  return Math.floor(
    (config.slaWeight * (config.attackPoints + config.defensePoints) * upCount) / results.length,
  );
}

export function calculateSlaForTick(
  services: ScoringService[],
  checkerResults: ScoringCheckerResult[],
  config: ScoringConfig,
  round: number,
  tick: number,
): ScoreResult {
  const resultsByService = Map.groupBy(checkerResults, (r) => r.serviceId);

  const serviceScoreRows: ServiceScoreRow[] = [];
  const scoreMap = new Map<number, ScoreRow>();

  for (const svc of services) {
    if (svc.teamId === 0) {
      continue;
    }

    const slaPoints = slaPointsFor(resultsByService.get(svc.id) ?? [], config);
    if (slaPoints === 0) {
      continue;
    }

    serviceScoreRows.push({
      teamId: svc.teamId,
      serviceId: svc.id,
      round,
      tick,
      attackPoints: 0,
      defensePoints: 0,
      slaPoints,
      totalPoints: slaPoints,
    });

    const existing = scoreMap.get(svc.teamId);
    if (existing) {
      existing.slaPoints += slaPoints;
      existing.totalPoints += slaPoints;
    } else {
      scoreMap.set(svc.teamId, {
        teamId: svc.teamId,
        round,
        tick,
        attackPoints: 0,
        defensePoints: 0,
        slaPoints,
        totalPoints: slaPoints,
      });
    }
  }

  return { serviceScoreRows, scoreRows: [...scoreMap.values()] };
}

export function calculateRoundScores(
  flags: ScoringFlag[],
  correctSubmissions: ScoringSubmission[],
  checkerResults: ScoringCheckerResult[],
  services: ScoringService[],
  config: ScoringConfig,
  round: number,
  tickPerRound: number,
): ScoreResult {
  const flagsByServiceTick = Map.groupBy(flags, (f) => `${f.serviceId}:${f.tick}`);
  const subsByFlag = Map.groupBy(correctSubmissions, (s) => s.flagId);
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const resultsByServiceTick = Map.groupBy(
    checkerResults,
    (r) => `${r.serviceId}:${r.round}:${r.tick}`,
  );

  const rows: ServiceScoreRow[] = [];

  for (const tickFlags of flagsByServiceTick.values()) {
    const first = tickFlags[0];
    if (first === undefined) {
      continue;
    }

    const svc = serviceById.get(first.serviceId);
    if (!svc) {
      continue;
    }

    const { serviceId, tick } = first;
    let heldCount = 0;

    for (const flag of tickFlags) {
      const submissions = subsByFlag.get(flag.id) ?? [];
      const attackers = submissions.filter((s) => s.teamId !== svc.teamId);

      if (attackers.length > 0) {
        const uniqueAttackers = new Set(attackers.map((a) => a.teamId));
        const firstBlood = attackers.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));

        for (const attackerId of uniqueAttackers) {
          let pts = config.attackPoints;
          if (config.firstBloodBonus !== null && firstBlood.teamId === attackerId) {
            pts += config.firstBloodBonus;
          }

          rows.push({
            teamId: attackerId,
            serviceId,
            round,
            tick,
            attackPoints: pts,
            defensePoints: 0,
            slaPoints: 0,
            totalPoints: pts,
          });
        }
      } else {
        heldCount++;
      }
    }

    if (heldCount > 0) {
      rows.push({
        teamId: svc.teamId,
        serviceId,
        round,
        tick,
        attackPoints: 0,
        defensePoints: heldCount * config.defensePoints,
        slaPoints: 0,
        totalPoints: heldCount * config.defensePoints,
      });
    }
  }

  for (const svc of services) {
    if (svc.teamId === 0) {
      continue;
    }

    for (let tick = 1; tick <= tickPerRound; tick++) {
      const results = resultsByServiceTick.get(`${svc.id}:${round}:${tick}`) ?? [];
      const slaPoints = slaPointsFor(results, config);
      if (slaPoints > 0) {
        rows.push({
          teamId: svc.teamId,
          serviceId: svc.id,
          round,
          tick,
          attackPoints: 0,
          defensePoints: 0,
          slaPoints,
          totalPoints: slaPoints,
        });
      }
    }
  }

  const scoreMap = new Map<string, ScoreRow>();
  for (const row of rows) {
    const key = `${row.teamId}:${row.round}:${row.tick}`;
    const existing = scoreMap.get(key);

    if (existing) {
      existing.attackPoints += row.attackPoints;
      existing.defensePoints += row.defensePoints;
      existing.slaPoints += row.slaPoints;
      existing.totalPoints += row.totalPoints;
    } else {
      scoreMap.set(key, {
        teamId: row.teamId,
        round: row.round,
        tick: row.tick,
        attackPoints: row.attackPoints,
        defensePoints: row.defensePoints,
        slaPoints: row.slaPoints,
        totalPoints: row.totalPoints,
      });
    }
  }

  return { serviceScoreRows: rows, scoreRows: [...scoreMap.values()] };
}
