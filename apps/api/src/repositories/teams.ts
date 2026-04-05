import { teams, type NewTeam } from "@api/db/schema/teams";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { Db } from "../db";

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

  static findAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => await env.db.query.teams.findMany(),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAllWithoutAdmins() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => await env.db.query.teams.findMany({ where: { role: "team" } }),
        catch: (e) => new Error(String(e)),
      }),
    );
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
