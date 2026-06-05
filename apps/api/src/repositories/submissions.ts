import { submissions, type NewSubmission } from "@api/db/schema/submissions";
import { relationsFilterToSQL, sql } from "drizzle-orm";
import { Effect } from "effect";
import type { WhereClause } from "../db/types";
import { Db } from "../db";
import { getOffset, type PaginationParams } from "../lib/pagination";

export abstract class SubmissionRepository {
  static findAll({ page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"submissions"> | undefined = search
        ? {
            OR: [
              {
                RAW: (table) =>
                  sql`to_tsvector('english', ${table.value}) @@ websearch_to_tsquery('english', ${search})`,
              },
              {
                RAW: (table) =>
                  sql`${table.teamId} IN (SELECT id FROM teams WHERE to_tsvector('english', name) @@ websearch_to_tsquery('english', ${search}))`,
              },
              ...(search.trim() !== ""
                ? ([
                    {
                      RAW: (table) =>
                        sql`CAST(${table.status} AS TEXT) ILIKE ${"%" + search + "%"}`,
                    },
                    {
                      RAW: (table) => sql`'R'||${table.round} ILIKE ${"%" + search + "%"}`,
                    },
                    {
                      RAW: (table) => sql`'T'||${table.tick} ILIKE ${"%" + search + "%"}`,
                    },
                    {
                      RAW: (table) =>
                        sql`'R'||${table.round}||'/T'||${table.tick} ILIKE ${"%" + search + "%"}`,
                    },
                    {
                      RAW: (table) =>
                        sql`to_char(${table.createdAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') ILIKE ${"%" + search + "%"}`,
                    },
                    {
                      RAW: (table) =>
                        sql`${table.teamId} IN (SELECT id FROM teams WHERE public_id ILIKE ${"%" + search + "%"} OR name ILIKE ${"%" + search + "%"})`,
                    },
                  ] satisfies NonNullable<WhereClause<"submissions">["OR"]>)
                : []),
            ],
          }
        : undefined;

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.submissions.findMany({
          where,
          with: {
            team: { columns: { publicId: true, name: true } },
            flag: { columns: { value: true } },
          },
          orderBy: { createdAt: "desc" },
          limit,
          offset,
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(submissions, where ? relationsFilterToSQL(submissions, where) : undefined),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({
          submissions: data,
          total: Number(total ?? 0),
        })),
      );
    });
  }

  static findById(id: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.query.submissions.findFirst({
            where: { id },
            with: {
              team: true,
              flag: true,
            },
          });
          return result ?? null;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByTeamId(teamId: number, { page, limit, search }: PaginationParams) {
    const offset = getOffset(page, limit);
    return Effect.flatMap(Db, (env) => {
      const where: WhereClause<"submissions"> | undefined = search
        ? {
            AND: [
              { teamId: { eq: teamId } },
              {
                OR: [
                  {
                    RAW: (table) =>
                      sql`to_tsvector('english', ${table.value}) @@ websearch_to_tsquery('english', ${search})`,
                  },
                  {
                    RAW: (table) =>
                      sql`${table.teamId} IN (SELECT id FROM teams WHERE to_tsvector('english', name) @@ websearch_to_tsquery('english', ${search}))`,
                  },
                  ...(search.trim() !== ""
                    ? ([
                        {
                          RAW: (table) =>
                            sql`CAST(${table.status} AS TEXT) ILIKE ${"%" + search + "%"}`,
                        },
                        {
                          RAW: (table) => sql`'R'||${table.round} ILIKE ${"%" + search + "%"}`,
                        },
                        {
                          RAW: (table) => sql`'T'||${table.tick} ILIKE ${"%" + search + "%"}`,
                        },
                        {
                          RAW: (table) =>
                            sql`'R'||${table.round}||'/T'||${table.tick} ILIKE ${"%" + search + "%"}`,
                        },
                        {
                          RAW: (table) =>
                            sql`to_char(${table.createdAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') ILIKE ${"%" + search + "%"}`,
                        },
                        {
                          RAW: (table) =>
                            sql`${table.teamId} IN (SELECT id FROM teams WHERE public_id ILIKE ${"%" + search + "%"} OR name ILIKE ${"%" + search + "%"})`,
                        },
                      ] satisfies NonNullable<WhereClause<"submissions">["OR"]>)
                    : []),
                ],
              },
            ],
          }
        : { teamId: { eq: teamId } };

      const dataQuery = Effect.tryPromise(() =>
        env.db.query.submissions.findMany({
          where,
          with: {
            team: { columns: { publicId: true, name: true } },
            flag: { columns: { value: true } },
          },
          orderBy: { createdAt: "desc" },
          limit,
          offset,
        }),
      );

      const totalQuery = Effect.tryPromise(() =>
        env.db.$count(submissions, relationsFilterToSQL(submissions, where)),
      );

      return Effect.all([dataQuery, totalQuery]).pipe(
        Effect.map(([data, total]) => ({
          submissions: data,
          total: Number(total ?? 0),
        })),
      );
    });
  }

  static findByTeamAndFlag(teamId: number, flagId: number) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.query.submissions.findFirst({
            where: {
              teamId,
              flagId,
              status: "correct",
            },
          });
          return result ?? null;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static create(data: NewSubmission) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(submissions).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
