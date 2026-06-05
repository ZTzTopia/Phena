import { teams, type NewTeam } from "@api/db/schema/teams";
import { eq, relationsFilterToSQL } from "drizzle-orm";
import { Effect } from "effect";
import type { WhereClause } from "../db/types";
import { Db } from "../db";
import { getOffset, type PaginationParams } from "../lib/pagination";

export abstract class TeamRepository {
  static findByName(name: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.teams.findFirst({
            where: { name },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByPublicId(publicId: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.query.teams.findFirst({
            where: { publicId },
          });
          return result;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static create(data: NewTeam) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(teams).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static update(publicId: string, data: Partial<NewTeam>) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db
            .update(teams)
            .set(data)
            .where(eq(teams.publicId, publicId))
            .returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAll({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"teams"> | undefined = search
        ? {
            OR: [
              { name: { ilike: `%${search}%` } },
              { publicId: { ilike: `%${search}%` } },
            ],
          }
        : undefined;

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.teams.findMany({
          columns: { password: false },
          where,
          limit,
          offset,
          orderBy: { createdAt: "desc" },
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(teams, where ? relationsFilterToSQL(teams, where) : undefined),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static findAllWithoutAdmins({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"teams"> = search
        ? {
            AND: [
              { role: { eq: "team" as const } },
              {
                OR: [
                  { name: { ilike: `%${search}%` } },
                  { publicId: { ilike: `%${search}%` } },
                ],
              },
            ],
          }
        : { role: { eq: "team" as const } };

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.teams.findMany({
          columns: { password: false },
          where,
          limit,
          offset,
          orderBy: { createdAt: "desc" },
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(teams, relationsFilterToSQL(teams, where)),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({ data, total: Number(total ?? 0) })),
      );
    });
  }

  static remove(publicId: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.delete(teams).where(eq(teams.publicId, publicId)).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
