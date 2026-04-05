import { config, type ConfigType } from "@api/db/schema/config";
import { ConfigKey } from "@phena/schema";
import { Effect } from "effect";
import { Db } from "../db";

export abstract class ConfigRepository {
  static get(key: ConfigKey) {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const row = await env.db.query.config.findFirst({
            where: { key },
          });
          return row?.value ?? null;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static getAll() {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          const rows = await env.db.query.config.findMany();
          return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }

  static set(key: ConfigKey, value: string, type: ConfigType = "string") {
    return Effect.flatMap(Db, (env) =>
      Effect.tryPromise({
        try: async () => {
          await env.db
            .insert(config)
            .values({ key, value, type })
            .onConflictDoUpdate({
              target: config.key,
              set: { value, updatedAt: new Date() },
            });
        },
        catch: (e) => new Error(String(e)),
      }),
    );
  }
}
