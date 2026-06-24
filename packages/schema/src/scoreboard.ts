import { z } from "zod/v4";

const ChallengePointsSchema = z.object({
  challengeId: z.number(),
  challengeName: z.string(),
  attackPoints: z.number(),
  defensePoints: z.number(),
  slaPoints: z.number(),
  totalPoints: z.number(),
  flagsStolen: z.number(),
  flagsDefended: z.number(),
  slaUp: z.number(),
  slaTotal: z.number(),
});

const StandingEntrySchema = z.object({
  rank: z.number(),
  teamId: z.string(),
  teamName: z.string(),
  attackPoints: z.number(),
  defensePoints: z.number(),
  slaPoints: z.number(),
  totalPoints: z.number(),
  flagsStolen: z.number(),
  flagsDefended: z.number(),
  slaUp: z.number(),
  slaTotal: z.number(),
  challenges: z.array(ChallengePointsSchema),
});

const HistoryPointSchema = z.object({
  round: z.number(),
  tick: z.number(),
  teamId: z.number(),
  teamName: z.string(),
  totalPoints: z.number(),
  cumulativeTotal: z.number(),
});

export const ScoreboardModel = {
  standingsResponse: z.object({
    standings: z.array(StandingEntrySchema),
  }),
  historyResponse: z.object({
    history: z.array(HistoryPointSchema),
  }),
};
