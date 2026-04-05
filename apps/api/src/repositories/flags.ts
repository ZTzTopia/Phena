import { flags, type NewFlag } from "@api/db/schema/flags";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class FlagRepository {
  static create(data: NewFlag) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const result = await env.db.insert(flags).values(data).returning();
          return result[0];
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static findByValue(value: string) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => await env.db.query.flags.findFirst({ where: { value } }),
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
