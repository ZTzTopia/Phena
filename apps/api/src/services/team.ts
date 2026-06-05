import type { NewTeam } from "@api/db/schema/teams";
import { hashPassword } from "@api/lib/password";
import { Effect } from "effect";
import {
  TeamCreateError,
  TeamNameTakenError,
  TeamNotFoundError,
  TeamUpdateError,
} from "../lib/errors";
import { getPaginationMeta, type PaginationParams } from "../lib/pagination";
import { TeamRepository } from "../repositories/teams";

export { TeamCreateError, TeamNameTakenError, TeamNotFoundError, TeamUpdateError };

export class TeamService extends Effect.Service<TeamService>()("TeamService", {
  effect: Effect.gen(function* () {
    const create = (data: NewTeam) =>
      Effect.gen(function* () {
        const team = yield* TeamRepository.findByName(data.name);
        if (team) {
          return yield* Effect.fail(new TeamNameTakenError({ message: "Name already taken" }));
        }

        const passwordHash = yield* hashPassword(data.password);
        const created = yield* TeamRepository.create({
          name: data.name,
          password: passwordHash,
          role: data.role,
        });

        if (!created) {
          return yield* Effect.fail(new TeamCreateError({ message: "Failed to create team" }));
        }

        return created;
      });

    const getByName = (name: string) => TeamRepository.findByName(name);

    const getByPublicId = (publicId: string) => TeamRepository.findByPublicId(publicId);

    const getAll = ({ page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* TeamRepository.findAll({ page, limit, search });
        return {
          teams: result.data,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const getAllWithoutAdmins = ({ page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* TeamRepository.findAllWithoutAdmins({ page, limit, search });
        return {
          teams: result.data,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const update = (publicId: string, data: Partial<NewTeam>) =>
      Effect.gen(function* () {
        const team = yield* TeamRepository.findByPublicId(publicId);
        if (!team) {
          return yield* Effect.fail(new TeamNotFoundError({ message: "Team not found" }));
        }

        if (data.name && data.name !== team.name) {
          const existing = yield* TeamRepository.findByName(data.name);
          if (existing) {
            return yield* Effect.fail(new TeamNameTakenError({ message: "Name already taken" }));
          }
        }

        if (data.password) {
          data.password = yield* hashPassword(data.password);
        }

        const updated = yield* TeamRepository.update(publicId, data);
        if (!updated) {
          return yield* Effect.fail(new TeamUpdateError({ message: "Failed to update team" }));
        }

        return updated;
      });

    const remove = (publicId: string) => TeamRepository.remove(publicId);

    yield* Effect.succeed(null);

    return {
      create,
      getByName,
      getByPublicId,
      getAll,
      getAllWithoutAdmins,
      update,
      delete: remove,
    };
  }),
}) {}
