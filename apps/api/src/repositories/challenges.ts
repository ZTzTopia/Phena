import { challenges, type NewChallenge } from "@api/db/schema/challenges";
import { eq, relationsFilterToSQL } from "drizzle-orm";
import { Effect } from "effect";
import type { WhereClause } from "../db/types";
import { Db } from "../db";
import { getOffset, type PaginationParams } from "../lib/pagination";

export abstract class ChallengeRepository {
  static findByPublicId(publicId: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.challenges.findFirst({
            where: { publicId },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAll({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"challenges"> | undefined = search
        ? {
            OR: [
              { title: { ilike: `%${search}%` } },
              { description: { ilike: `%${search}%` } },
              { category: { ilike: `%${search}%` } },
              { publicId: { ilike: `%${search}%` } },
            ],
          }
        : undefined;

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.challenges.findMany({
          where,
          limit,
          offset,
          orderBy: { createdAt: "desc" },
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(challenges, where ? relationsFilterToSQL(challenges, where) : undefined),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static create(data: NewChallenge) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(challenges).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static update(publicId: string, data: Partial<NewChallenge>) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .update(challenges)
            .set(data)
            .where(eq(challenges.publicId, publicId))
            .returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static remove(publicId: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .delete(challenges)
            .where(eq(challenges.publicId, publicId))
            .returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
