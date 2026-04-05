import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, Layer } from "effect";
import { relations } from "./relations";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL ?? "postgresql://phena:phena@localhost:5432/phena",
    ssl: false,
  },
  relations,
});

export type Database = typeof db;
export class Db extends Context.Tag("Db")<Db, { readonly db: Database }>() {}
export const DbLive = Layer.effect(Db, Effect.succeed({ db }));
