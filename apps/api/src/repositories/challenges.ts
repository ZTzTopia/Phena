import { challenges, type NewChallenge } from "@api/db/schema/challenges";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class ChallengeRepository {
  static findByPublicId(publicId: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () =>
          env.db.query.challenges.findFirst({
            where: {
              publicId,
            },
          }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => env.db.query.challenges.findMany(),
        catch: (e) => new Error(String(e)),
      }),
    );
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
