import { scoresPerTick } from "@api/db/schema/scores";
import { serviceScoresPerTick } from "@api/db/schema/service-scores";
import { services as servicesTable } from "@api/db/schema/services";
import { teams as teamsTable } from "@api/db/schema/teams";
import { challenges as challengesTable } from "@api/db/schema/challenges";
import { flags as flagsTable } from "@api/db/schema/flags";
import { submissions as submissionsTable } from "@api/db/schema/submissions";
import { checkerResults as checkerResultsTable } from "@api/db/schema/checker-results";
import { isNull, sql, and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class ScoreRepository {
  static deleteScoresForRound(round: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.delete(scoresPerTick).where(
            sql`${scoresPerTick.round} = ${round} AND ${scoresPerTick.deletedAt} IS NULL`,
          ),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static deleteServiceScoresForRound(round: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.delete(serviceScoresPerTick).where(
            sql`${serviceScoresPerTick.round} = ${round} AND ${serviceScoresPerTick.deletedAt} IS NULL`,
          ),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static deleteScoresForTick(round: number, tick: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.delete(scoresPerTick).where(
            sql`${scoresPerTick.round} = ${round} AND ${scoresPerTick.tick} = ${tick} AND ${scoresPerTick.deletedAt} IS NULL`,
          ),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static deleteServiceScoresForTick(round: number, tick: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.delete(serviceScoresPerTick).where(
            sql`${serviceScoresPerTick.round} = ${round} AND ${serviceScoresPerTick.tick} = ${tick} AND ${serviceScoresPerTick.deletedAt} IS NULL`,
          ),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static insertScores(rows: (typeof scoresPerTick.$inferInsert)[]) {
    if (rows.length === 0) return Effect.void;
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () => env.db.insert(scoresPerTick).values(rows),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static insertServiceScores(rows: (typeof serviceScoresPerTick.$inferInsert)[]) {
    if (rows.length === 0) return Effect.void;
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () => env.db.insert(serviceScoresPerTick).values(rows),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findFlagsByRound(round: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.query.flags.findMany({
            where: { round, deletedAt: { isNull: true } },
            with: { service: { columns: { teamId: true } } },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findCorrectSubmissionsByRound(round: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.query.submissions.findMany({
            where: {
              status: "correct",
              deletedAt: { isNull: true },
              round,
            },
            columns: { flagId: true, teamId: true, createdAt: true },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findCheckerResultsByRound(round: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.query.checkerResults.findMany({
            where: { round, deletedAt: { isNull: true } },
            columns: { serviceId: true, round: true, tick: true, status: true },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findCheckerResultsByTick(round: number, tick: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.query.checkerResults.findMany({
            where: { round, tick, deletedAt: { isNull: true } },
            columns: { serviceId: true, round: true, tick: true, status: true },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAllServices() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: () =>
          env.db.query.services.findMany({
            where: { deletedAt: { isNull: true } },
            columns: { id: true, teamId: true, challengeId: true },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getStandings() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .select({
              teamId: scoresPerTick.teamId,
              teamName: teamsTable.name,
              teamPublicId: teamsTable.publicId,
              attackPoints: sql<number>`COALESCE(SUM(${scoresPerTick.attackPoints}), 0)`,
              defensePoints: sql<number>`COALESCE(SUM(${scoresPerTick.defensePoints}), 0)`,
              slaPoints: sql<number>`COALESCE(SUM(${scoresPerTick.slaPoints}), 0)`,
              totalPoints: sql<number>`COALESCE(SUM(${scoresPerTick.totalPoints}), 0)`,
            })
            .from(scoresPerTick)
            .innerJoin(teamsTable, sql`${scoresPerTick.teamId} = ${teamsTable.id}`)
            .where(isNull(scoresPerTick.deletedAt))
            .groupBy(scoresPerTick.teamId, teamsTable.name, teamsTable.publicId)
            .orderBy(sql`COALESCE(SUM(${scoresPerTick.totalPoints}), 0) DESC`);

          return result.map((row, i) => ({
            rank: i + 1,
            teamId: row.teamPublicId,
            teamNumericId: row.teamId,
            teamName: row.teamName,
            attackPoints: row.attackPoints,
            defensePoints: row.defensePoints,
            slaPoints: row.slaPoints,
            totalPoints: row.totalPoints,
          }));
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getStandingsBreakdown() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .select({
              teamId: serviceScoresPerTick.teamId,
              challengeId: challengesTable.id,
              challengeName: challengesTable.title,
              attackPoints: sql<number>`COALESCE(SUM(${serviceScoresPerTick.attackPoints}), 0)`,
              defensePoints: sql<number>`COALESCE(SUM(${serviceScoresPerTick.defensePoints}), 0)`,
              slaPoints: sql<number>`COALESCE(SUM(${serviceScoresPerTick.slaPoints}), 0)`,
              totalPoints: sql<number>`COALESCE(SUM(${serviceScoresPerTick.totalPoints}), 0)`,
            })
            .from(serviceScoresPerTick)
            .innerJoin(
              servicesTable,
              sql`${serviceScoresPerTick.serviceId} = ${servicesTable.id}`,
            )
            .innerJoin(
              challengesTable,
              sql`${servicesTable.challengeId} = ${challengesTable.id}`,
            )
            .where(isNull(serviceScoresPerTick.deletedAt))
            .groupBy(serviceScoresPerTick.teamId, challengesTable.id, challengesTable.title)
            .orderBy(serviceScoresPerTick.teamId, challengesTable.title);

          const byTeam = new Map<
            number,
            { challengeId: number; challengeName: string; attackPoints: number; defensePoints: number; slaPoints: number; totalPoints: number }[]
          >();
          for (const row of result) {
            const arr = byTeam.get(row.teamId) ?? [];
            arr.push({
              challengeId: row.challengeId,
              challengeName: row.challengeName,
              attackPoints: row.attackPoints,
              defensePoints: row.defensePoints,
              slaPoints: row.slaPoints,
              totalPoints: row.totalPoints,
            });
            byTeam.set(row.teamId, arr);
          }
          return byTeam;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getFlagStats() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          // ponytail: compute both stats in JS from three small table scans.
          // CTF scale (≤10 teams, ≤10k flags) makes the trip to PG for a NOT EXISTS
          // subquery not worth the executor round-trips. Upgrade when teams > 50.
          const [stolenRows, flags, correctSubs] = await Promise.all([
            env.db
              .select({
                teamId: submissionsTable.teamId,
                flagsStolen: sql<number>`COUNT(*)`,
              })
              .from(submissionsTable)
              .where(
                and(eq(submissionsTable.status, "correct"), isNull(submissionsTable.deletedAt)),
              )
              .groupBy(submissionsTable.teamId),
            env.db.query.flags.findMany({
              where: { deletedAt: { isNull: true } },
              columns: { id: true, serviceId: true },
              with: { service: { columns: { teamId: true } } },
            }),
            env.db.query.submissions.findMany({
              where: { status: "correct", deletedAt: { isNull: true } },
              columns: { flagId: true, teamId: true },
            }),
          ]);

          const stolen = new Map<number, number>();
          for (const r of stolenRows) stolen.set(r.teamId, Number(r.flagsStolen));

          const stolenFlagIdsByOtherTeam = new Set<number>();
          for (const s of correctSubs) {
            if (s.flagId !== null) stolenFlagIdsByOtherTeam.add(s.flagId);
          }
          const stolenFlagIds = new Set(stolenFlagIdsByOtherTeam);

          const defended = new Map<number, number>();
          for (const f of flags) {
            if (stolenFlagIds.has(f.id)) continue;
            const ownerTeamId = (f as typeof f & { service: { teamId: number } }).service?.teamId;
            if (ownerTeamId === undefined) continue;
            defended.set(ownerTeamId, (defended.get(ownerTeamId) ?? 0) + 1);
          }

          const teamIds = new Set([...stolen.keys(), ...defended.keys()]);
          return new Map(
            Array.from(teamIds).map((teamId) => [
              teamId,
              {
                flagsStolen: stolen.get(teamId) ?? 0,
                flagsDefended: defended.get(teamId) ?? 0,
              },
            ]),
          );
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getSlaStats() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          // ponytail: full-scan group-by, fine at CTF scale (≤10 teams × ≤5 services × ≤50 ticks).
          const rows = await env.db
            .select({
              teamId: servicesTable.teamId,
              slaUp: sql<number>`COUNT(CASE WHEN ${checkerResultsTable.status} = 'up' THEN 1 END)`,
              slaTotal: sql<number>`COUNT(*)`,
            })
            .from(checkerResultsTable)
            .innerJoin(
              servicesTable,
              sql`${checkerResultsTable.serviceId} = ${servicesTable.id}`,
            )
            .where(isNull(checkerResultsTable.deletedAt))
            .groupBy(servicesTable.teamId);

          return new Map(
            rows.map((r) => [r.teamId, { slaUp: Number(r.slaUp), slaTotal: Number(r.slaTotal) }]),
          );
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getPerChallengeFlagStats() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          // Flags stolen grouped by (team, challenge). Joins via submission → flag → service → challenge.
          const stolenRows = await env.db
            .select({
              teamId: submissionsTable.teamId,
              challengeId: servicesTable.challengeId,
              flagsStolen: sql<number>`COUNT(*)`,
            })
            .from(submissionsTable)
            .innerJoin(flagsTable, sql`${submissionsTable.flagId} = ${flagsTable.id}`)
            .innerJoin(servicesTable, sql`${flagsTable.serviceId} = ${servicesTable.id}`)
            .where(and(eq(submissionsTable.status, "correct"), isNull(submissionsTable.deletedAt)))
            .groupBy(submissionsTable.teamId, servicesTable.challengeId);

          const stolen = new Map<string, number>();
          for (const r of stolenRows) stolen.set(`${r.teamId}:${r.challengeId}`, Number(r.flagsStolen));
          return stolen;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getPerChallengeSlaStats() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          // ponytail: full scan, fine at CTF scale.
          const rows = await env.db
            .select({
              teamId: servicesTable.teamId,
              challengeId: servicesTable.challengeId,
              slaUp: sql<number>`COUNT(CASE WHEN ${checkerResultsTable.status} = 'up' THEN 1 END)`,
              slaTotal: sql<number>`COUNT(*)`,
            })
            .from(checkerResultsTable)
            .innerJoin(
              servicesTable,
              sql`${checkerResultsTable.serviceId} = ${servicesTable.id}`,
            )
            .where(isNull(checkerResultsTable.deletedAt))
            .groupBy(servicesTable.teamId, servicesTable.challengeId);

          return new Map(
            rows.map((r) => [
              `${r.teamId}:${r.challengeId}`,
              { slaUp: Number(r.slaUp), slaTotal: Number(r.slaTotal) },
            ]),
          );
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getHistory() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .select({
              round: scoresPerTick.round,
              tick: scoresPerTick.tick,
              teamId: scoresPerTick.teamId,
              teamName: teamsTable.name,
              totalPoints: sql<number>`COALESCE(SUM(${scoresPerTick.totalPoints}), 0)`,
            })
            .from(scoresPerTick)
            .innerJoin(teamsTable, sql`${scoresPerTick.teamId} = ${teamsTable.id}`)
            .where(isNull(scoresPerTick.deletedAt))
            .groupBy(scoresPerTick.round, scoresPerTick.tick, scoresPerTick.teamId, teamsTable.name)
            .orderBy(scoresPerTick.round, scoresPerTick.tick, scoresPerTick.teamId);

          // Compute cumulative per team
          const cumByTeam = new Map<number, number>();
          return result.map((row) => {
            const prev = cumByTeam.get(row.teamId) ?? 0;
            const cumulative = prev + row.totalPoints;
            cumByTeam.set(row.teamId, cumulative);
            return {
              round: row.round,
              tick: row.tick,
              teamId: row.teamId,
              teamName: row.teamName,
              totalPoints: row.totalPoints,
              cumulativeTotal: cumulative,
            };
          });
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
