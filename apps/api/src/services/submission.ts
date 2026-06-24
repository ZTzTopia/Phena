import type { NewSubmission } from "@api/db/schema/submissions";
import { FlagRepository } from "@api/repositories/flags";
import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { FlagAlreadySubmittedError, FlagSubmitError, SubmissionNotFoundError } from "../lib/errors";
import { getPaginationMeta, type PaginationParams } from "../lib/pagination";
import { SubmissionRepository } from "../repositories/submissions";
import { ConfigService } from "./config";

export { FlagAlreadySubmittedError, FlagSubmitError, SubmissionNotFoundError };

export class SubmissionService extends Effect.Service<SubmissionService>()("SubmissionService", {
  effect: Effect.gen(function* () {
    const submit = (data: Pick<NewSubmission, "teamId" | "value">) =>
      Effect.gen(function* () {
        const isRunning = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.IsRunning));
        const currentRound = yield* ConfigService.use((svc) =>
          svc.getConfig(ConfigKey.CurrentRound),
        );
        const currentTick = yield* ConfigService.use((svc) => svc.getConfig(ConfigKey.CurrentTick));

        if (!isRunning) {
          return yield* Effect.fail(new FlagSubmitError({ message: "Contest is not running" }));
        }

        const flag = yield* FlagRepository.findByValue(data.value);
        if (!flag) {
          const submission = yield* SubmissionRepository.create({
            teamId: data.teamId,
            flagId: null,
            value: data.value,
            status: "incorrect",
            tick: currentTick,
            round: currentRound,
          });
          if (!submission) {
            return yield* Effect.fail(new FlagSubmitError({ message: "Failed to submit flag" }));
          }

          return yield* Effect.succeed(submission);
        }

        if (flag.service && flag.service.teamId === data.teamId) {
          const submission = yield* SubmissionRepository.create({
            teamId: data.teamId,
            flagId: flag.id,
            value: data.value,
            status: "self_submitted",
            tick: currentTick,
            round: currentRound,
          });
          if (!submission) {
            return yield* Effect.fail(new FlagSubmitError({ message: "Failed to submit flag" }));
          }

          return yield* Effect.succeed(submission);
        }

        const existing = yield* SubmissionRepository.findByTeamAndFlag(data.teamId, flag.id);
        if (existing) {
          const submission = yield* SubmissionRepository.create({
            teamId: data.teamId,
            flagId: flag.id,
            value: data.value,
            status: "already_submitted",
            tick: currentTick,
            round: currentRound,
          });
          if (!submission) {
            return yield* Effect.fail(new FlagSubmitError({ message: "Failed to submit flag" }));
          }

          return yield* Effect.succeed(submission);
        }

        // TODO: Should we check for tick too? (or how the fck A&D works??)
        if (flag.round != currentRound) {
          const submission = yield* SubmissionRepository.create({
            teamId: data.teamId,
            flagId: flag.id,
            value: data.value,
            status: "incorrect",
            tick: currentTick,
            round: currentRound,
          });
          if (!submission) {
            return yield* Effect.fail(new FlagSubmitError({ message: "Failed to submit flag" }));
          }

          return yield* Effect.succeed(submission);
        }

        const submission = yield* SubmissionRepository.create({
          teamId: data.teamId,
          flagId: flag.id,
          value: data.value,
          status: "correct",
          tick: currentTick,
          round: currentRound,
        });
        if (!submission) {
          return yield* Effect.fail(new FlagSubmitError({ message: "Failed to submit flag" }));
        }

        return yield* Effect.succeed(submission);
      });

    const getAll = ({ page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* SubmissionRepository.findAll({ page, limit, search });
        return {
          submissions: result.submissions,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const getByTeamId = (teamId: number, { page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* SubmissionRepository.findByTeamId(teamId, { page, limit, search });
        return {
          submissions: result.submissions,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const getById = (id: number) =>
      Effect.gen(function* () {
        const submission = yield* SubmissionRepository.findById(id);
        if (!submission) {
          return yield* Effect.fail(
            new SubmissionNotFoundError({ message: "Submission not found" }),
          );
        }

        return submission;
      });

    yield* Effect.succeed(null);

    return {
      submit,
      getAll,
      getByTeamId,
      getById,
    };
  }),
}) {}
