import type { NewServiceOperation } from "@api/db/schema/service-operations";
import type { NewService } from "@api/db/schema/services";
import { TeamRepository } from "@api/repositories/teams";
import { Effect } from "effect";
import { ServiceNotFoundError, ServiceCreateError } from "../lib/errors";
import { ServiceRepository } from "../repositories/services";

export { ServiceNotFoundError, ServiceCreateError };

export class ServiceService extends Effect.Service<ServiceService>()("ServiceService", {
  effect: Effect.gen(function* () {
    const getAll = () => ServiceRepository.findAll();

    const getById = (id: number) => ServiceRepository.findById(id);

    const getByTeamId = (publicTeamId: string) =>
      Effect.gen(function* () {
        const team = yield* TeamRepository.findByPublicId(publicTeamId);
        if (!team) {
          return yield* Effect.fail(new ServiceNotFoundError({ message: "Team not found" }));
        }
        return yield* ServiceRepository.findByTeamId(team.id);
      });

    const getByChallengeId = (challengeId: number) =>
      ServiceRepository.findByChallengeId(challengeId);

    const create = (data: NewService) =>
      Effect.gen(function* () {
        const created = yield* ServiceRepository.create(data);
        if (!created) {
          return yield* Effect.fail(
            new ServiceCreateError({ message: "Failed to create service" }),
          );
        }
        return created;
      });

    const createOperation = (data: NewServiceOperation) =>
      Effect.gen(function* () {
        const existing = yield* ServiceRepository.findById(data.serviceId);
        if (!existing) {
          return yield* Effect.fail(new ServiceNotFoundError({ message: "Service not found" }));
        }

        const operation = yield* ServiceRepository.createOperation({
          serviceId: data.serviceId,
          adminId: data.adminId,
          type: data.type,
        });
        if (!operation) {
          return yield* Effect.fail(
            new ServiceCreateError({ message: "Failed to create service operation" }),
          );
        }
        return operation;
      });

    const submitCheckerResult = (data: {
      serviceId: number;
      teamId: number;
      challengeId: number;
      round: number;
      tick: number;
      status: "up" | "down" | "error";
      message?: string;
      latency?: number;
      checkedAt: Date;
    }) =>
      Effect.gen(function* () {
        const existing = yield* ServiceRepository.findById(data.serviceId);
        if (!existing) {
          return yield* Effect.fail(new ServiceNotFoundError({ message: "Service not found" }));
        }

        yield* ServiceRepository.updateStatusFromChecker(data.serviceId, data.status);

        const result = yield* ServiceRepository.createCheckerResult({
          serviceId: data.serviceId,
          round: data.round,
          tick: data.tick,
          status: data.status,
          message: data.message ?? null,
          latency: data.latency ?? null,
          createdAt: data.checkedAt,
        });

        return result;
      });

    const findMissingServices = () => ServiceRepository.findMissingServices();

    const autoCreateForTeamChallenge = (teamId: number, challengeId: number) =>
      Effect.gen(function* () {
        const existing = yield* ServiceRepository.findAll();
        const hasExisting = existing.some(
          (s) => s.teamId === teamId && s.challengeId === challengeId,
        );

        if (hasExisting) {
          return yield* Effect.succeed(null);
        }

        const created = yield* ServiceRepository.create({
          teamId,
          challengeId,
          status: "pending",
        });

        if (!created) {
          return yield* Effect.fail(
            new ServiceCreateError({ message: "Failed to create service" }),
          );
        }

        return created;
      });

    const autoCreateAllMissing = () =>
      Effect.gen(function* () {
        const missing = yield* findMissingServices();
        const created: { teamId: number; challengeId: number }[] = [];

        for (const m of missing) {
          const result = yield* autoCreateForTeamChallenge(m.teamId, m.challengeId);
          if (result) {
            created.push({ teamId: m.teamId, challengeId: m.challengeId });
          }
        }

        return created;
      });

    yield* Effect.succeed(null);

    return {
      getAll,
      getById,
      getByTeamId,
      getByChallengeId,
      create,
      createOperation,
      submitCheckerResult,
      findMissingServices,
      autoCreateForTeamChallenge,
      autoCreateAllMissing,
    };
  }),
}) {}
