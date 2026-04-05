import { submissions, type NewSubmission } from "@api/db/schema/submissions";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class SubmissionRepository {
  static findAll({ page, limit, search }: { page: number; limit: number; search?: string }) {
    const offset = (page - 1) * limit;
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.query.submissions.findMany({
            with: {
              team: true,
              flag: true,
            },
            orderBy: { createdAt: "desc" },
            offset,
            limit,
          });

          const total = await env.db.query.submissions.findMany();
          return {
            submissions: result,
            total: total.length,
          };
        },
        catch: (e) => new Error(String(e)),
      }),
    );
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

  static findByTeamId(
    teamId: number,
    { page, limit, search }: { page: number; limit: number; search?: string },
  ) {
    const offset = (page - 1) * limit;
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.query.submissions.findMany({
            where: {
              teamId,
            },
            with: {
              team: true,
              flag: true,
            },
            orderBy: { createdAt: "desc" },
            offset,
            limit,
          });

          const total = await env.db.query.submissions.findMany({
            where: {
              teamId,
            },
          });
          return {
            submissions: result,
            total: total.length,
          };
        },
        catch: (e) => new Error(String(e)),
      }),
    );
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
