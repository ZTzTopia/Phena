import type { NewChallenge } from "@api/db/schema/challenges";
import { Effect } from "effect";
import { ChallengeCreateError, ChallengeNotFoundError, ChallengeUpdateError } from "../lib/errors";
import { deleteFile, saveFile } from "../lib/file-storage";
import { getPaginationMeta, type PaginationParams } from "../lib/pagination";
import { ChallengeRepository } from "../repositories/challenges";

export class ChallengeService extends Effect.Service<ChallengeService>()("ChallengeService", {
  effect: Effect.gen(function* () {
    const create = (data: NewChallenge) =>
      Effect.gen(function* () {
        const created = yield* ChallengeRepository.create(data);
        if (!created) {
          return yield* Effect.fail(
            new ChallengeCreateError({ message: "Failed to create challenge" }),
          );
        }

        return created;
      });

    const getByPublicId = (publicId: string) => ChallengeRepository.findByPublicId(publicId);

    const getAll = ({ page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* ChallengeRepository.findAll({ page, limit, search });
        return {
          challenges: result.data,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const update = (publicId: string, data: Partial<NewChallenge>) =>
      Effect.gen(function* () {
        const existing = yield* ChallengeRepository.findByPublicId(publicId);
        if (!existing) {
          return yield* Effect.fail(new ChallengeNotFoundError({ message: "Challenge not found" }));
        }

        const updated = yield* ChallengeRepository.update(publicId, data);
        if (!updated) {
          return yield* Effect.fail(
            new ChallengeUpdateError({ message: "Failed to update challenge" }),
          );
        }

        return updated;
      });

    const remove = (publicId: string) =>
      Effect.gen(function* () {
        const existing = yield* ChallengeRepository.findByPublicId(publicId);
        if (!existing) {
          return yield* Effect.fail(new ChallengeNotFoundError({ message: "Challenge not found" }));
        }

        if (existing.filePath) {
          const ext = existing.filePath.slice(existing.filePath.lastIndexOf("."));
          yield* deleteFile(publicId, ext);
        }

        const removed = yield* ChallengeRepository.remove(publicId);
        if (!removed) {
          return yield* Effect.fail(
            new ChallengeUpdateError({ message: "Failed to delete challenge" }),
          );
        }

        return removed;
      });

    const uploadFile = (publicId: string, file: File) =>
      Effect.gen(function* () {
        const existing = yield* ChallengeRepository.findByPublicId(publicId);
        if (!existing) {
          return yield* Effect.fail(new ChallengeNotFoundError({ message: "Challenge not found" }));
        }

        if (existing.filePath) {
          const ext = existing.filePath.slice(existing.filePath.lastIndexOf("."));
          yield* deleteFile(publicId, ext);
        }

        const { path, hash } = yield* saveFile(publicId, file);

        const updated = yield* ChallengeRepository.update(publicId, {
          filePath: path,
          fileHash: hash,
        });

        if (!updated) {
          return yield* Effect.fail(
            new ChallengeUpdateError({ message: "Failed to update file info" }),
          );
        }

        return { path: updated.filePath ?? path, hash: updated.fileHash ?? hash };
      });

    yield* Effect.succeed(null);

    return {
      create,
      getByPublicId,
      getAll,
      update,
      delete: remove,
      uploadFile,
    };
  }),
}) {}
