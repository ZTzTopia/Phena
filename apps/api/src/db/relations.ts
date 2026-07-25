import { defineRelations } from "drizzle-orm";
import * as challenges from "./schema/challenges";
import * as checkerResults from "./schema/checker-results";
import * as config from "./schema/config";
import * as configStore from "./schema/config-store";
import * as flags from "./schema/flags";
import * as notifications from "./schema/notifications";
import * as scores from "./schema/scores";
import * as serviceOperations from "./schema/service-operations";
import * as serviceScores from "./schema/service-scores";
import * as services from "./schema/services";
import * as sshConfigs from "./schema/ssh-configs";
import * as submissions from "./schema/submissions";
import * as systemLogs from "./schema/system-logs";
import * as teams from "./schema/teams";

const schema = {
  ...teams,
  ...services,
  ...challenges,
  ...flags,
  ...submissions,
  ...scores,
  ...checkerResults,
  ...config,
  ...configStore,
  ...serviceOperations,
  ...serviceScores,
  ...sshConfigs,
  ...systemLogs,
  ...notifications,
};

export const relations = defineRelations(schema, (r) => ({
  teams: {
    submissions: r.many.submissions({
      from: r.teams.id,
      to: r.submissions.teamId,
    }),
    services: r.many.services({
      from: r.teams.id,
      to: r.services.teamId,
    }),
    scores: r.many.scoresPerTick({
      from: r.teams.id,
      to: r.scoresPerTick.teamId,
    }),
  },
  challenges: {
    services: r.many.services({
      from: r.challenges.id,
      to: r.services.challengeId,
    }),
  },
  flags: {
    service: r.one.services({
      from: r.flags.serviceId,
      to: r.services.id,
    }),
  },
  submissions: {
    team: r.one.teams({
      from: r.submissions.teamId,
      to: r.teams.id,
    }),
    flag: r.one.flags({
      from: r.submissions.flagId,
      to: r.flags.id,
    }),
  },
  services: {
    team: r.one.teams({
      from: r.services.teamId,
      to: r.teams.id,
    }),
    challenge: r.one.challenges({
      from: r.services.challengeId,
      to: r.challenges.id,
    }),
    flags: r.many.flags({
      from: r.services.id,
      to: r.flags.serviceId,
    }),
    checkerResults: r.many.checkerResults({
      from: r.services.id,
      to: r.checkerResults.serviceId,
    }),
  },
  scoresPerTick: {
    team: r.one.teams({
      from: r.scoresPerTick.teamId,
      to: r.teams.id,
    }),
  },
  serviceScoresPerTick: {
    team: r.one.teams({
      from: r.serviceScoresPerTick.teamId,
      to: r.teams.id,
    }),
    service: r.one.services({
      from: r.serviceScoresPerTick.serviceId,
      to: r.services.id,
    }),
  },
  checkerResults: {
    service: r.one.services({
      from: r.checkerResults.serviceId,
      to: r.services.id,
    }),
  },
  serviceOperations: {
    service: r.one.services({
      from: r.serviceOperations.serviceId,
      to: r.services.id,
    }),
    admin: r.one.teams({
      from: r.serviceOperations.adminId,
      to: r.teams.id,
    }),
  },
  sshConfigs: {
    team: r.one.teams({
      from: r.sshConfigs.teamId,
      to: r.teams.id,
    }),
  },
  systemLogs: {
    team: r.one.teams({
      from: r.systemLogs.teamId,
      to: r.teams.id,
    }),
  },
  config: {},
  configStore: {},
  notifications: {
    team: r.one.teams({
      from: r.notifications.teamId,
      to: r.teams.id,
    }),
  },
}));
