import type { RelationsFilter, SchemaEntry, SQL, TableFilter } from "drizzle-orm";
import { relations } from "./relations";

export type WhereClause<T extends keyof typeof relations> = RelationsFilter<
  (typeof relations)[T],
  typeof relations
>;

declare module "drizzle-orm" {
  export function relationsFilterToSQL<T extends SchemaEntry>(
    table: T,
    filter: TableFilter<T>,
  ): SQL | undefined;
}
