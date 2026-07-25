import { drizzle } from "drizzle-orm/node-postgres";
import { Effect } from "effect";
import { Pool } from "pg";
import { relations } from "./relations";

const dbUrl = process.env.DATABASE_URL ?? "postgresql://phena:phena@localhost:5432/phena";

const pool = new Pool({ connectionString: dbUrl, ssl: false });

export const db = drizzle({ client: pool, relations });
export type Database = typeof db;

export class Db extends Effect.Service<Db>()("Db", {
  scoped: Effect.gen(function* () {
    yield* Effect.addFinalizer(() => Effect.promise(() => pool.end()));
    return { db } as const;
  }),
}) {}
