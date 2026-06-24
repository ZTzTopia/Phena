import { RedisClient } from "@api/lib/redis";
import { ScoreRepository } from "@api/repositories/scores";
import { ConfigKey, SSEEventType, SSE_EVENT_CHANNELS } from "@phena/schema";
import { Effect } from "effect";
import {
  calculateRoundScores,
  calculateSlaForTick,
  type ScoringFlag,
  type ScoringSubmission,
  type ScoringCheckerResult,
  type ScoringService as ScoringServiceType,
} from "../lib/scoring";
import { ConfigService } from "./config";

export class ScoreService extends Effect.Service<ScoreService>()("ScoreService", {
  effect: Effect.gen(function* () {
    const loadConfig = () =>
      Effect.gen(function* () {
        const [attackPoints, defensePoints, slaWeight, firstBloodBonus, tickPerRound] =
          yield* Effect.all([
            ConfigService.use((svc) => svc.getConfig(ConfigKey.AttackPoints)),
            ConfigService.use((svc) => svc.getConfig(ConfigKey.DefensePoints)),
            ConfigService.use((svc) => svc.getConfig(ConfigKey.SlaWeight)),
            ConfigService.use((svc) => svc.getConfig(ConfigKey.FirstBloodBonus)),
            ConfigService.use((svc) => svc.getConfig(ConfigKey.TickPerRound)),
          ]);
        return {
          scoringConfig: {
            attackPoints,
            defensePoints,
            slaWeight,
            firstBloodBonus,
          },
          tickPerRound,
        };
      });

    const emitScoreboardEvent = () =>
      Effect.flatMap(RedisClient, (r) =>
        r.publish(
          SSE_EVENT_CHANNELS.Global,
          JSON.stringify({
            type: SSEEventType.Scoreboard,
            data: {},
            timestamp: Date.now(),
          }),
        ),
      );

    const computeSlaForTick = (round: number, tick: number) =>
      Effect.gen(function* () {
        const { scoringConfig } = yield* loadConfig();
        const [checkerResults, services] = yield* Effect.all([
          ScoreRepository.findCheckerResultsByTick(round, tick),
          ScoreRepository.findAllServices(),
        ]);

        if (checkerResults.length === 0) return;

        const typedResults: ScoringCheckerResult[] = checkerResults.map((cr) => ({
          serviceId: cr.serviceId,
          round: cr.round,
          tick: cr.tick,
          status: cr.status,
        }));

        const typedServices: ScoringServiceType[] = services.map((s) => ({
          id: s.id,
          teamId: s.teamId,
        }));

        const result = calculateSlaForTick(typedServices, typedResults, scoringConfig, round, tick);

        if (result.serviceScoreRows.length === 0) return;

        yield* Effect.all([
          ScoreRepository.deleteScoresForTick(round, tick),
          ScoreRepository.deleteServiceScoresForTick(round, tick),
        ]);

        yield* Effect.all([
          ScoreRepository.insertScores(result.scoreRows),
          ScoreRepository.insertServiceScores(result.serviceScoreRows),
        ]);

        yield* emitScoreboardEvent();

        yield* Effect.logDebug(
          `Computed SLA for round ${round} tick ${tick}: ${result.scoreRows.length} team(s) updated`,
        );
      });

    const computeRoundScores = (round: number) =>
      Effect.gen(function* () {
        const { scoringConfig, tickPerRound } = yield* loadConfig();

        const [flags, submissions, checkerResults, services] = yield* Effect.all([
          ScoreRepository.findFlagsByRound(round),
          ScoreRepository.findCorrectSubmissionsByRound(round),
          ScoreRepository.findCheckerResultsByRound(round),
          ScoreRepository.findAllServices(),
        ]);

        const typedFlags: ScoringFlag[] = flags.flatMap((f) => {
          const ownerTeamId = (f as typeof f & { service: { teamId: number } }).service?.teamId;
          if (!ownerTeamId) return [];
          return {
            id: f.id,
            serviceId: f.serviceId,
            ownerTeamId,
            round: f.round,
            tick: f.tick,
          };
        });

        const typedSubmissions: ScoringSubmission[] = submissions.map((s) => ({
          flagId: s.flagId!,
          teamId: s.teamId,
          createdAt: s.createdAt,
        }));

        const typedResults: ScoringCheckerResult[] = checkerResults.map((cr) => ({
          serviceId: cr.serviceId,
          round: cr.round,
          tick: cr.tick,
          status: cr.status,
        }));

        const typedServices: ScoringServiceType[] = services.map((s) => ({
          id: s.id,
          teamId: s.teamId,
        }));

        const result = calculateRoundScores(
          typedFlags,
          typedSubmissions,
          typedResults,
          typedServices,
          scoringConfig,
          round,
          tickPerRound,
        );

        yield* Effect.all([
          ScoreRepository.deleteScoresForRound(round),
          ScoreRepository.deleteServiceScoresForRound(round),
        ]);

        yield* Effect.all([
          ScoreRepository.insertScores(result.scoreRows),
          ScoreRepository.insertServiceScores(result.serviceScoreRows),
        ]);

        yield* emitScoreboardEvent();

        yield* Effect.logDebug(
          `Computed scores for round ${round}: ${result.scoreRows.length} team(s)`,
        );
      });

    const getStandingsWithBreakdown = () =>
      Effect.gen(function* () {
        const [standings, breakdown, flagStats, slaStats, perChallengeFlag, perChallengeSla] =
          yield* Effect.all([
            ScoreRepository.getStandings(),
            ScoreRepository.getStandingsBreakdown(),
            ScoreRepository.getFlagStats(),
            ScoreRepository.getSlaStats(),
            ScoreRepository.getPerChallengeFlagStats(),
            ScoreRepository.getPerChallengeSlaStats(),
          ]);
        // ponytail: PG returns SUM/COUNT(bigint) as strings via node-postgres.
        // Coerce at the boundary so the Zod response schema gets real numbers.
        return standings.map((entry) => ({
          rank: entry.rank,
          teamId: entry.teamId,
          teamName: entry.teamName,
          attackPoints: Number(entry.attackPoints),
          defensePoints: Number(entry.defensePoints),
          slaPoints: Number(entry.slaPoints),
          totalPoints: Number(entry.totalPoints),
          flagsStolen: flagStats.get(entry.teamNumericId)?.flagsStolen ?? 0,
          flagsDefended: flagStats.get(entry.teamNumericId)?.flagsDefended ?? 0,
          slaUp: slaStats.get(entry.teamNumericId)?.slaUp ?? 0,
          slaTotal: slaStats.get(entry.teamNumericId)?.slaTotal ?? 0,
          challenges: (breakdown.get(entry.teamNumericId) ?? []).map((c) => ({
            challengeId: c.challengeId,
            challengeName: c.challengeName,
            attackPoints: Number(c.attackPoints),
            defensePoints: Number(c.defensePoints),
            slaPoints: Number(c.slaPoints),
            totalPoints: Number(c.totalPoints),
            flagsStolen: perChallengeFlag.get(`${entry.teamNumericId}:${c.challengeId}`) ?? 0,
            flagsDefended: 0,
            slaUp: perChallengeSla.get(`${entry.teamNumericId}:${c.challengeId}`)?.slaUp ?? 0,
            slaTotal: perChallengeSla.get(`${entry.teamNumericId}:${c.challengeId}`)?.slaTotal ?? 0,
          })),
        }));
      });
    const getHistory = () => ScoreRepository.getHistory();

    return {
      computeSlaForTick,
      computeRoundScores,
      getStandingsWithBreakdown,
      getHistory,
    };
  }),
}) {}
