import { systemLogs, type NewSystemLog } from "@api/db/schema/system-logs";
import { relationsFilterToSQL } from "drizzle-orm";
import { Effect } from "effect";
import type { WhereClause } from "../db/types";
import { Db } from "../db";
import { getOffset, type PaginationParams } from "../lib/pagination";

export abstract class SystemLogRepository {
  static findAll({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"systemLogs"> | undefined = search
        ? {
            OR: [{ message: { ilike: `%${search}%` } }, { type: { ilike: `%${search}%` } }],
          }
        : undefined;

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.systemLogs.findMany({
          with: {
            team: true,
          },
          where: where
            ? { AND: [{ deletedAt: { isNull: true } }, where] }
            : { deletedAt: { isNull: true } },
          limit,
          offset,
          orderBy: { createdAt: "desc" },
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(
          systemLogs,
          where
            ? relationsFilterToSQL(systemLogs, { AND: [{ deletedAt: { isNull: true } }, where] })
            : relationsFilterToSQL(systemLogs, { deletedAt: { isNull: true } }),
        ),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static create(data: NewSystemLog) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(systemLogs).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
