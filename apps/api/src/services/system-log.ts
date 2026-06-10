import type { NewSystemLog } from "@api/db/schema/system-logs";
import { Effect } from "effect";
import { getPaginationMeta, type PaginationParams } from "../lib/pagination";
import { SystemLogRepository } from "../repositories/system-logs";

export class SystemLogService extends Effect.Service<SystemLogService>()("SystemLogService", {
  effect: Effect.gen(function* () {
    const getAll = ({ page, limit, search }: PaginationParams) =>
      Effect.gen(function* () {
        const result = yield* SystemLogRepository.findAll({ page, limit, search });
        return {
          logs: result.data,
          pagination: getPaginationMeta(page, limit, result.total),
        };
      });

    const create = (data: NewSystemLog) =>
      Effect.gen(function* () {
        const log = yield* SystemLogRepository.create(data);
        return log;
      });

    yield* Effect.succeed(null);

    return {
      getAll,
      create,
    };
  }),
}) {}
