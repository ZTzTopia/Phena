import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { services } from "./services";

export const flags = pgTable(
  "flags",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    serviceId: bigint("service_id", { mode: "number" })
      .notNull()
      .references(() => services.id),

    round: integer("round").notNull(),
    tick: integer("tick").notNull(),

    index: integer("flag_index").notNull().default(0),
    value: text("value").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    uniqueIndex("flags_unique_idx")
      .on(table.serviceId, table.index, table.round, table.tick)
      .where(sql`${table.deletedAt} IS NULL`),
    index("flags_created_at_idx").on(table.createdAt),
  ],
);

export type Flag = typeof flags.$inferSelect;
export type NewFlag = typeof flags.$inferInsert;
